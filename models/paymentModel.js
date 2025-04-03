const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    mode: {
        type: String,
        enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: {
        type: String
    },
    orderId: {
        type: String,
        unique: true
    },
    receipt: {
        type: String
    }
}, { timestamps: true }); // This adds createdAt and updatedAt fields automatically

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;