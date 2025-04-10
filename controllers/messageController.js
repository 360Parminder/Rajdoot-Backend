const ApiKey = require('../models/apiKeyModel'); // Assume you have API key model
const User = require('../models/userModel'); // Assume you have User model
const Message = require('../models/messageModel'); // Assume you have Message model
const mqtt = require('mqtt');


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
    // increase message count
    try {
        const client = mqtt.connect('mqtt://broker.hivemq.com', {
            debug: true // Enable verbose logging
        });
        const { content, recipient } = req.body;
        // console.log(content, recipient);
        const command = "SEND_SMS +918779112732 Hello World";


        try {
            client.publish('esp32/uno/commands', command, (err) => {
                if (err) console.error("Send failed:", err);

                else {
                    console.log("Command sent:", command);

                }
            });


        } catch (error) {
            return next(new AppError(500, 'fail', 'Error sending message'), req, res, next);
        }
    } catch (error) {
       return next(new AppError(500, 'fail', 'Error sending message'), req, res, next);
    }
};

