
const Otp = require('../models/otpModel');
const Message = require('../models/messageModel');
const { generateOTP } = require('../utils/otpUtils.js');
const mqtt = require('./mqttController');

// Send OTP to user's phone number
exports.sendOTP = async (req, res) => {
    try {
        const { recipient,otp_length } = req.body;
        const serverNumber = process.env.FROM_NUMBER; // server phone number
        const deviceId = process.env.DEVICE_ID; // actual device ID
        
        // Generate OTP
        const otp = generateOTP(otp_length || 6);
        const message = `Your OTP is: ${otp}`;
        // Calculate expiration time (5 minutes from now)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);

        // Create OTP record
        const otpRecord = await Otp.create({
            otp,
            serverNumber,
            recipient,
            expiresAt,
            user: req.user._id
        });

        // Send OTP via SMS
        const topic = `${mqtt.topicPrefix}/${deviceId}/commands`;
        const payload = JSON.stringify({
            phone: recipient,
            message: `Your OTP is: ${otp}`,
            timestamp: Date.now()
          });

          const es32response=   await mqtt.publish(topic, payload);

          if (es32response) {
            return res.status(200).json({
                status: 'success',
                message: 'OTP sent successfully',
                otpRecord
            });
        } else {
            return next(new AppError(500, 'fail', 'Failed to send OTP'), req, res, next);
        }
    } catch (error) {
        return next(new AppError(500, 'fail', 'Failed to send OTP'), req, res, next);
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { otp, recipient } = req.body;

        // Find the most recent OTP for the given phone number
        const otpRecord = await Otp.findOne({
            recipient,
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
