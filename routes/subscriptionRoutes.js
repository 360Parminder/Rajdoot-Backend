const express = require('express');
const subscriptionController = require('../controllers/subscriptionsController');
const { protect } = require('../controllers/authController');

const router = express.Router();


// Get all subscriptions
// router.get('/', protect, subscriptionController.getAllSubscriptions);

// // Get subscription by ID
// router.get('/:id', auth, subscriptionController.getSubscriptionById);

// Create new subscription
// router.post('/', protect, subscriptionController.createSubscription);

// Update subscription
// router.put('/:id', auth, subscriptionController.updateSubscription);

// // Cancel/Delete subscription
// router.delete('/:id', auth, subscriptionController.deleteSubscription);

// // Upgrade/downgrade subscription
// router.patch('/:id/change-plan', auth, subscriptionController.changePlan);

// // Renew subscription
router.post('/renew', protect, subscriptionController.renewSubscription);

module.exports = router;
