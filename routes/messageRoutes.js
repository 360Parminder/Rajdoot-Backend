const express = require('express');
const messageController = require('../controllers/messageController');
const authController = require('../controllers/authController');
const otpController = require('../controllers/otpController')



const router = express.Router();

// Middleware to check if the user is authenticated
router.use(authController.protect);

// Apply middlewares to all routes
router.use(messageController.validateApiCredentials);
router.use(messageController.checkUserPlan);

// Message routes
router.post('/send-message', messageController.sendMessage);
// OTP routes
router.post('/send-otp',otpController.sendOTP);
router.post('/verify-otp',otpController.verifyOTP);
// router.get('/status/:messageId', messageController.getMessageStatus);

module.exports = router;
