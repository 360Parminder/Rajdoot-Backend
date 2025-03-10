const express = require('express');
const messageController = require('../controllers/messageController');



const router = express.Router();

// Apply middlewares to all routes
router.use(messageController.validateApiCredentials);
router.use(messageController.checkUserPlan);

// Message routes
router.post('/send', messageController.sendMessage);
// router.get('/status/:messageId', messageController.getMessageStatus);

module.exports = router;
