const {Plan} = require('../models/plansModel'); // Assuming you have a Plan model

// Get all plans
exports.getAllPlans = async (req, res) => {
    try {
        const plans = await Plan.find();
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching plans', error: error.message });
    }
};

// Get a specific plan by ID
exports.getPlanById = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        res.status(200).json(plan);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching plan', error: error.message });
    }
};

// Create a new plan
exports.createPlan = async (req, res) => {
    try {
        const newPlan = new Plan(req.body);
        const savedPlan = await newPlan.save();
        res.status(201).json(savedPlan);
    } catch (error) {
        res.status(400).json({ message: 'Error creating plan', error: error.message });
    }
};

// Update an existing plan
exports.updatePlan = async (req, res) => {
    try {
        const updatedPlan = await Plan.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedPlan) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        res.status(200).json(updatedPlan);
    } catch (error) {
        res.status(400).json({ message: 'Error updating plan', error: error.message });
    }
};

// Delete a plan
exports.deletePlan = async (req, res) => {
    try {
        const deletedPlan = await Plan.findByIdAndDelete(req.params.id);
        if (!deletedPlan) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        res.status(200).json({ message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting plan', error: error.message });
    }
};