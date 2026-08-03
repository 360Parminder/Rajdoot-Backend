const { default: axios } = require("axios");
const Payment = require("../models/paymentModel");
const AppError = require("../utils/appError");
const  generateReceiptId  = require("../utils/generateReceiptId");


// Create a payment intent
exports.createPaymentIntent =async (req, res, next) => {
    const { amount, currency = 'INR',planId } = req.body;
    const userId = req.user._id;
    const receiptId= generateReceiptId();
    if (!amount || !currency) {
        return next(new AppError('Please provide amount and currency', 400));
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
        return next(new AppError('Invalid amount', 400));
    }

    const response = await axios.post('https://api.razorpay.com/v1/orders', {
        amount: amount * 100, // Convert to paise
        currency: currency,
        receipt: receiptId,
      }, {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        }
      });
      if (!response.data) {
        return next(new AppError('Failed to create payment intent', 500));
      }
      
   const payment= await Payment.create({

        userId,
        planId,
        amount,
        status: 'pending',
        receiptId: receiptId,
        orderId: response.data.id

   })
    if (!payment) {
        return next(new AppError('Failed to create payment', 500));
    }
    res.status(201).json({
        status: 'success',
        data: {
            orderId: response.data.id,
            amount: amount,
            currency: currency,
            receiptId: receiptId
        }
    });
};

// Confirm payment
// exports.addPayment = async (req, res, next) => {
//     const { 
//         orderId, 
//         userId,
//         planId,
//         amount,
//         mode,
//         status,
//         transactionId,
//         receipt
//     } = req.body;

//     if (!receipt || !orderId) {
//         return next(new AppError('Receipt ID and order ID are required', 400));
//     }

//     // payment logic
//     const payment = await Payment.create({
//         userId,
//         planId,
//         amount,
//         mode,
//         status,
//         transactionId,
//         orderId,
//         receipt
//     }
//     );
//     res.status(201).json({
//         status: 'success',
//         data: {
//             payment
//         }
//     });
   
// };
// Verify payment

exports.verifyPayment = async (req, res, next) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return next(new AppError('Payment verification failed', 400));
    }

    // Verify payment with Razorpay
    const crypto = require('crypto');
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    if (generatedSignature !== razorpay_signature) {
        return next(new AppError('Payment verification failed', 400));
    }
    
    // Update payment status in the database
    const payment = await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: 'completed', transactionId: razorpay_payment_id },
        { new: true }
    );

    if (!payment) {
        return next(new AppError('Payment not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            payment
        }
    });
}


// Get payment history for a user
exports.getPaymentById = async (req, res, next) => {
    const userId = req.user._id;
    const payments = await Payment.find({ userId }).populate('planId');
    if (!payments) {
        return next(new AppError('No payments found for this user', 404));
    }

    res.status(200).json({
        status: 'success',
        results: payments.length,
        data: {
            payments
        }
    });
};

// Refund a payment
// exports.refundPayment = catchAsync(async (req, res, next) => {
//     const { orderId, amount, reason } = req.body;
    
//     const order = await Order.findById(orderId);
//     if (!order) {
//         return next(new AppError('Order not found', 404));
//     }
    
//     if (!order.isPaid) {
//         return next(new AppError('Cannot refund unpaid order', 400));
//     }
    
//     const paymentId = order.paymentResult.id;
    
//     // Create refund
//     const refund = await stripe.refunds.create({
//         payment_intent: paymentId,
//         amount: amount ? Math.round(amount * 100) : undefined, // If amount is provided, convert to cents
//         reason: reason || 'requested_by_customer'
//     });
    
//     // Update order with refund info
//     order.isRefunded = true;
//     order.refundedAt = Date.now();
//     order.refundResult = {
//         id: refund.id,
//         status: refund.status,
//         amount: refund.amount / 100 // Convert back to dollars
//     };
    
//     await order.save();
    
//     res.status(200).json({
//         status: 'success',
//         data: {
//             refundId: refund.id,
//             status: refund.status,
//             order
//         }
//     });
// });