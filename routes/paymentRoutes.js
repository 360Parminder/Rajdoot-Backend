const express = require('express');
const { protect,} = require('../controllers/authController');
const paymentController = require('../controllers/paymentController.js');

const router = express.Router();


// Routes for payments
router.route('/')
    .post(protect,  paymentController.addPayment)
    .get(protect, /* paymentController.getAllPayments */);

// You can add more payment-related routes here as needed
// For example:
router.route('/payment-history')
  .get(protect,  paymentController.getPaymentById )
//   .put(protect, /* paymentController.updatePayment */)
//   .delete(protect, admin, /* paymentController.deletePayment */);

module.exports = router;