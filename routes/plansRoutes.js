const express = require('express');
const planController = require('../controllers/planController.js');
const authController = require('../controllers/authController');

const router = express.Router();
const auth = authController.protect;
// Get all plans
router.get('/', planController.getAllPlans);

// Get a specific plan
router.get('/:id', planController.getPlanById);

// Create a plan
router.post('/', auth, planController.createPlan);

// Update a plan
router.put('/:id', auth, planController.updatePlan);

// Delete a plan
router.delete('/:id', auth, planController.deletePlan);

module.exports = router;
