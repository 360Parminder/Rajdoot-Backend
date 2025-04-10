const express = require('express');
const authController = require('../controllers/authController');
const paymentController = require('../controllers/paymentController.js');

const router = express.Router();


// Routes for payments
router.use(authController.protect)
router.route('/')
    .post(paymentController.createPaymentIntent)
    .get( /* paymentController.getAllPayments */);

// Route to confirm payment
router.route('/verify')
    .post(paymentController.verifyPayment);
// You can add more payment-related routes here as needed
// For example:
router.route('/payment-history')
  .get(paymentController.getPaymentById )
//   .put(protect, /* paymentController.updatePayment */)
//   .delete(protect, admin, /* paymentController.deletePayment */);

module.exports = router;