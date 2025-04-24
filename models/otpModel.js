const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    otp: {
        type: String,
        required: true,
    },
    // This field is used for server phone number
    fromPhoneNumber: {
        type: String,
        required: true,
    },
    // This field is used for client phone number
    // It is the phone number to which the OTP is sent
    toPhoneNumber: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '5m', // OTP will expire after 5 minutes
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true,
    },
});

// Create the OTP model
const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
