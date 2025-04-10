const express = require('express');
const planController = require('../controllers/planController.js');
const authController = require('../controllers/authController');

const router = express.Router();


// Get all plans

router.get('/', planController.getAllPlans);

// Get a specific plan
router.get('/:id', planController.getPlanById);


router.use(authController.protect);


router.use(authController.restrictTo(["admin", "developer"]));

// Create a plan
router.post('/', auth, planController.createPlan);

// Update a plan
router.put('/:id', auth, planController.updatePlan);

// Delete a plan
router.delete('/:id', auth, planController.deletePlan);

module.exports = router;
