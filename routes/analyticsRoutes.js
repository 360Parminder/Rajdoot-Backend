const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authController = require('../controllers/authController');

// Protect all analytics endpoints so only authenticated users access their metrics
router.use(authController.protect);

router.get('/overview', analyticsController.getOverview);
router.get('/messages-over-time', analyticsController.getMessagesTimeData);
router.get('/calls-over-time', analyticsController.getCallsTimeData);
router.get('/error-breakdown', analyticsController.getErrorBreakdown);
router.get('/cost-breakdown', analyticsController.getCostBreakdown);
router.get('/recent-failed-messages', analyticsController.getRecentFailedMessages);
router.get('/recent-failed-calls', analyticsController.getRecentFailedCalls);
router.get('/top-numbers', analyticsController.getTopNumbers);
router.get('/active-alerts', analyticsController.getActiveAlerts);

module.exports = router;
