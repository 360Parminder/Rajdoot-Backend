const Payment = require("../models/paymentModel");
const AppError = require("../utils/appError");


// Create a payment intent
// exports.createPaymentIntent = catchAsync(async (req, res, next) => {
//     const { amount, currency = 'usd', orderId } = req.body;

//     if (!amount || !orderId) {
//         return next(new AppError('Please provide amount and order ID', 400));
//     }

//     // Fetch order to verify
//     const order = await Order.findById(orderId);
//     if (!order) {
//         return next(new AppError('Order not found', 404));
//     }

//     // Create payment intent
//     const paymentIntent = await stripe.paymentIntents.create({
//         amount: Math.round(amount * 100), // Convert to cents
//         currency,
//         metadata: { orderId }
//     });

//     res.status(200).json({
//         status: 'success',
//         clientSecret: paymentIntent.client_secret,
//         paymentIntentId: paymentIntent.id
//     });
// });

// Confirm payment
exports.addPayment = async (req, res, next) => {
    const { 
        orderId, 
        userId,
        planId,
        amount,
        mode,
        status,
        transactionId,
        receipt
    } = req.body;

    if (!receipt || !orderId) {
        return next(new AppError('Receipt ID and order ID are required', 400));
    }

    // payment logic
    const payment = await Payment.create({
        userId,
        planId,
        amount,
        mode,
        status,
        transactionId,
        orderId,
        receipt
    }
    );
    res.status(201).json({
        status: 'success',
        data: {
            payment
        }
    });
   
};

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