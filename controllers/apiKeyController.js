const crypto = require('crypto');
const ApiKey = require('../models/apiKeyModel'); // Assuming you have an ApiKey model
const AppError = require('../utils/appError');

// Generate new API key
exports.generateApiKey = async (req, res,next) => {
    const { name, description } = req.body;
    try {
        const apiKey = crypto.randomBytes(32).toString('hex');
        const userId = req.user.id; // Assuming you have user authentication
        const keyId = crypto.randomBytes(16).toString('hex');

        // check user have active plan
        if (!req.user.plan || req.user.plan.status !== 'active') {
            return next(new AppError(403, 'fail', 'No active plan found'), req, res);
        }
        

        const newApiKey = new ApiKey({
            keyId: keyId,
            secretKey: apiKey,
            userId: userId,
            isActive: true,
            role: 'user',
            name: name,
            description: description
        });

        await newApiKey.save();

        res.status(201).json({
            success: true,
            data: {
                name: name,
                description: description,
                keyId: keyId,
                apiKey: apiKey,
            }
        });
    } catch (error) {
        next(new AppError(500, 'fail', 'Error generating API key', req, res));
    }
};

// Update API key status
exports.updateApiKey = async (req, res) => {
    try {
        const { keyId, isActive } = req.body;
        const userId = req.user.id;

        const apiKey = await ApiKey.findOne({keyId: keyId, userId });
        
        if (!apiKey) {
            return res.status(404).json({
                success: false,
                error: 'API key not found'
            });
        }

        apiKey.isActive = isActive;
        await apiKey.save();

        res.status(200).json({
            success: true,
            data: apiKey
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error updating API key'
        });
    }
};

// Delete API key
exports.deleteApiKey = async (req, res) => {
    try {
        const { keyId } = req.query;
        const userId = req.user.id;
    
        const result = await ApiKey.findOneAndDelete({ keyId:keyId, userId });
        const newApis = await ApiKey.find({ userId }).select('-key');
        if (newApis.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No API keys found'
            });
        }
       
        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'API key not found'
            });
        }

        res.status(200).json({
            success: true,
             newApis,
            message: 'API key deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error deleting API key'
        });
    }
};

// Get all API keys for a user
exports.getApiKeys = async (req, res) => {
    try {
        const userId = req.user.id;
        const apiKeys = await ApiKey.find({ userId }).select('-key');

        res.status(200).json({
            success: true,
            data: apiKeys
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching API keys'
        });
    }
};

// Get all API keys

exports.getAllApiKeys = async (req, res) => {
    const userId = req.user.id;
    try {
        const apiKeys = await ApiKey.find({userId}).select('-key');

        res.status(200).json({
            success: true,
            data: apiKeys
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching API keys'
        });
    }
}