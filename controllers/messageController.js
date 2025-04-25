const ApiKey = require('../models/apiKeyModel'); // Assume you have API key model
const User = require('../models/userModel'); // Assume you have User model
const Message = require('../models/messageModel'); // Assume you have Message model
const mqtt = require('./mqttController');
const AppError = require('../utils/appError'); // Assume you have AppError utility

// Middleware to validate API key and ID
exports.validateApiCredentials = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
        const apiId = req.headers['x-api-id'];
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
exports.sendMessage = async (req, res,next) => {
    const { message, recipient } = req.body;
    const serverNumber = process.env.FROM_NUMBER; // Replace with actual server number
    const deviceId = process.env.DEVICE_ID; // Replace with actual device ID
    // Validate message and recipient
    if (!message || !recipient) {
        return next(new AppError(400, 'fail', 'Message and recipient are required'), req, res, next);
    }
    // Validate message length
    if (message.length > 160) {
        return next(new AppError(400, 'fail', 'Message length exceeds 160 characters'), req, res, next);
    }
    // Validate recipient format (e.g., phone number)
    const recipientRegex = /^[0-9]{10}$/; // Example regex for 10-digit phone number
    if (!recipientRegex.test(recipient)) {
        return next(new AppError(400, 'fail', 'Invalid recipient format'), req, res, next);
    }
    const topic = `${mqtt.topicPrefix}/${deviceId}/commands`;
    const payload = JSON.stringify({
        phone: recipient,
        message: message,
        timestamp: Date.now()
      });

   const es32response=   await mqtt.publish(topic, payload);
    if (es32response) {
        const messageData = await Message.create({
            user:req.user._id,
            recipient,
            serverNumber,
            apiId: req.headers['x-api-id'],
            content: message,
            status:'delivered'
        })
        return res.status(200).json({
            status: 'success',
            message: 'Message sent successfully',
            data: messageData
        });
    } else {
        return next(new AppError(500, 'fail', 'Failed to send message'), req, res, next);
    }
   
};

