
const Otp = require('../models/otpModel');
const Message = require('../models/messageModel');
const { generateOTP } = require('../utils/otpUtils.js');

// Send OTP to user's phone number
exports.sendOTP = async (req, res) => {
    try {
        const { toPhoneNumber,otpLength } = req.body;
        const fromPhoneNumber = process.env.FROM_NUMBER;
        
        // Generate OTP
        const otp = generateOTP(otpLength || 6);
        // Calculate expiration time (5 minutes from now)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);

        // Create OTP record
        const otpRecord = await Otp.create({
            otp,
            fromPhoneNumber,
            toPhoneNumber,
            expiresAt,
            user: req.user._id
        });

        // Send OTP via SMS
        const message = await sendMessage({
            fromNumber: fromPhoneNumber,
            toNumber: toPhoneNumber,
            content: `Your OTP is: ${otp}. It will expire in 5 minutes.`
        });

        // Save message record
        await Message.create({
            userId: req.user._id,
            fromNumber: fromPhoneNumber,
            toNumber: toPhoneNumber,
            apiId: message.sid,
            status: 'sent',
            content: `OTP: ${otp}`
        });

        res.status(200).json({
            status: 'success',
            message: 'OTP sent successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to send OTP',
            error: error.message
        });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { otp, toPhoneNumber } = req.body;

        // Find the most recent OTP for the given phone number
        const otpRecord = await Otp.findOne({
            toPhoneNumber,
            isVerified: false
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                status: 'error',
                message: 'No OTP found or OTP already verified'
            });
        }

        // Check if OTP has expired
        if (new Date() > otpRecord.expiresAt) {
            return res.status(400).json({
                status: 'error',
                message: 'OTP has expired'
            });
        }

        // Verify OTP
        if (otp !== otpRecord.otp) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid OTP'
            });
        }

        // Mark OTP as verified
        otpRecord.isVerified = true;
        await otpRecord.save();

        res.status(200).json({
            status: 'success',
            message: 'OTP verified successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to verify OTP',
            error: error.message
        });
    }
};
