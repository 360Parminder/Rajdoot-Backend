const ApiKey = require('../models/apiKeyModel'); // Assume you have API key model
const User = require('../models/userModel'); // Assume you have User model
const Message = require('../models/messageModel'); // Assume you have Message model
const mqtt = require('./mqttController');
const AppError = require('../utils/appError'); // Assume you have AppError utility
const mongoose = require('mongoose');

// Middleware to validate API key and ID
exports.validateApiCredentials = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
        const apiId = req.headers['x-api-id'];
        // console.log(req.headers);
        // console.log(apiKey, apiId);
        if (!apiKey || !apiId) {
          return next(new AppError(401, 'fail', 'API key and ID are required'), req, res, next);
        }

        const validApi = await ApiKey.findOne({
            secretKey: apiKey,
            keyId: apiId,
            isActive: true
        });
        // console.log(validApi);

        if (!validApi) {
           return next(new AppError(401, 'fail', 'Invalid API key or ID'), req, res, next);
        }

        req.userId = validApi.userId;
        next();
    } catch (error) {
      return  next(new AppError(500, 'fail', 'Error validating API credentials'), req, res, next);
    }
};

// Middleware to check user plan
exports.checkUserPlan = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return next(new AppError(404, 'fail', 'User not found'), req, res, next);
        }

        if (!user.plan || user.plan.status !== 'active') {
            return next(new AppError(403, 'fail', 'User plan is not active'), req, res, next);
        }

        // Check if user has exceeded monthly message limit
        const currentMonth = new Date().getMonth();
        const messageCount = await Message.countDocuments({
            userId: req.userId,
            createdAt: {
                $gte: new Date(new Date().setMonth(currentMonth)),
                $lt: new Date(new Date().setMonth(currentMonth + 1))
            }
        });

        if (messageCount >= user.plan.monthlyMessageLimit) {
            return next(new AppError(403, 'fail', 'Monthly message limit exceeded'), req, res, next);
        }

        next();
    } catch (error) {
        return next(new AppError(500, 'fail', 'Error checking user plan'), req, res, next);
    }
};

// Controller to send message
exports.sendMessage = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        // Validate request body
        const { message, recipient } = req.body;
        const serverNumber = process.env.FROM_NUMBER;
        const deviceId = process.env.DEVICE_ID;

        // Validate message and recipient
        if (!message || !recipient) {
            await session.abortTransaction();
            session.endSession();
            return next(new AppError(400, 'fail', 'Message and recipient are required'), req, res, next);
        }

        // Validate message length
        if (message.length > 150) {
            await session.abortTransaction();
            session.endSession();
            return next(new AppError(400, 'fail', 'Message length exceeds 150 characters'), req, res, next);
        }

        // Validate recipient format
        const recipientRegex = /^[0-9]{10}$/;
        if (!recipientRegex.test(recipient)) {
            await session.abortTransaction();
            session.endSession();
            return next(new AppError(400, 'fail', 'Invalid recipient format'), req, res, next);
        }

        // First perform database operations within the transaction
        const [messageData, updatedUser] = await Promise.all([
            Message.create([{
                user: req.user._id,
                recipient,
                serverNumber,
                apiId: req.headers['x-api-id'],
                content: message,
                status: 'pending' // Set initial status as pending
            }], { session }),
            
            User.findByIdAndUpdate(
                req.user._id,
                { $inc: { 'messageCount': 1 } },
                { new: true, session }
            )
        ]);

        // If database operations succeeded, commit the transaction
        await session.commitTransaction();
        
        try {
            // Now send the message via MQTT
            const topic = `${mqtt.topicPrefix}/${deviceId}/commands`;
            const payload = JSON.stringify({
                phone: recipient,
                message: message,
                timestamp: Date.now()
            });

            const es32response = await mqtt.publish(topic, payload);
            
            if (!es32response) {
                // If MQTT fails, update the message status to failed
                await Message.findByIdAndUpdate(
                    messageData[0]._id,
                    { status: 'failed' }
                );
                
                session.endSession();
                return next(new AppError(500, 'fail', 'Failed to send message'), req, res, next);
            }

            // Update message status to delivered
            await Message.findByIdAndUpdate(
                messageData[0]._id,
                { status: 'delivered' }
            );

            session.endSession();
            return res.status(200).json({
                status: 'success',
                message: 'Message sent successfully',
                data: {
                    message: {
                        ...messageData[0].toObject(),
                        status: 'delivered'
                    },
                    user: updatedUser
                }
            });

        } catch (mqttError) {
            // If MQTT fails after successful DB commit
            await Message.findByIdAndUpdate(
                messageData[0]._id,
                { status: 'failed' }
            );
            
            session.endSession();
            return next(new AppError(500, 'fail', 'Message queued but sending failed'), req, res, next);
        }

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return next(new AppError(500, 'fail', 'Transaction failed'), req, res, next);
    }
};


