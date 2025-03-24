const ApiKey = require('../models/apiKeyModel'); // Assume you have API key model
const User = require('../models/userModel'); // Assume you have User model
const Message = require('../models/messageModel'); // Assume you have Message model
const { default: axios } = require('axios');


// Middleware to validate API key and ID
exports.validateApiCredentials = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
        const apiId = req.headers['x-api-id'];
        // console.log(apiKey, apiId);

        if (!apiKey || !apiId) {
            return res.status(401).json({ error: 'API key and API ID are required' });
        }

        const validApi = await ApiKey.findOne({
            secretKey: apiKey,
            keyId: apiId,
            isActive: true
        });

        if (!validApi) {
            return res.status(401).json({ error: 'Invalid API credentials' });
        }

        req.userId = validApi.userId;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Error validating API credentials' });
    }
};

// Middleware to check user plan
exports.checkUserPlan = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.plan || user.plan.status !== 'active') {
            return res.status(403).json({ error: 'No active plan found' });
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
            return res.status(403).json({ error: 'Monthly message limit exceeded' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Error checking user plan' });
    }
};

// Controller to send message
exports.sendMessage = async (req, res) => {
    try {
        const { content, recipient } = req.body;
        console.log(content, recipient);
        

        if (!content || !recipient) {
            return res.status(400).json({ error: 'Message content and recipient are required' });
        }
        // Kannel configuration
        const KANNEL_URL = process.env.KANNEL_URL; // Replace with your Kannel URL
        const KANNEL_USERNAME = process.env.KANNEL_USERNAME; // Replace with your Kannel username
        const KANNEL_PASSWORD = process.env.KANNEL_PASSWORD; // Replace with your Kannel password

      try {
          
          const response = await axios.get(KANNEL_URL, {
              params: {
                  username: KANNEL_USERNAME,
                  password: KANNEL_PASSWORD,
                  to: recipient,
                  text: content,
              },
          });
  
        //   console.log(response);
          if (response.data.includes('Accepted for delivery')) {
              
              const message = new Message({
                  userId: req.userId,
                  fromNumber: process.env.FROM_NUMBER,
                  toNumber: recipient,
                  apiId: req.headers['x-api-id'],
                  status: 'sent',
                  content,
              });
              
              await message.save();
                res.status(200).json({
                    success: true,
                    message: 'Message sent successfully',
                    data: message
                });
            } else {
                res.status(500).json({ error: 'Error sending message' });
            }
      } catch (error) {
        // console.log(error);
        res.status(500).json({ error: 'Error sending message' });
    }
    } catch (error) {
        res.status(500).json({ error: 'Error sending message' });
    }
};

