const User = require("../models/userModel");
const AppError = require("../utils/appError");

exports.updateSubscriptionPlan = asyncHandler(async (req, res, next) => {
    // Get current active subscription if exists
    const plan = req.body.plan;
    const currentSubscription = await User.findOne({
        _id: req.user.id,
        plan: { $elemMatch: { status: 'active' } }
    }).populate('plan.plans.planId');
    
    // Check if plan data is provided
    if (!req.body.plan) {
        return next(new AppError(400, "success",'Please provide a plan to subscribe to '));
    }
    
    // If user has an active subscription
    if (currentSubscription) {
        // Check if subscription is expired
        const now = new Date();
        const expiryDate = new Date(currentSubscription.expiryDate);
        
        if (expiryDate > now) {
            // Subscription is still active
            // Update existing subscription
            const updatedSubscription = await User.findAndUpdate(
                currentSubscription._id,
                {
                    Plan: req.body.plan._id,
                    startDate:new Date(),
                    expiryDate: new Date()+360*24*60*1000, // 30 days from now
                    status: 'active'
                },
                {
                    new: true,
                    runValidators: true
                }
            );
            
            return res.status(200).json({
                success: true,
                data: updatedSubscription,
                message: 'Subscription plan updated successfully'
            });
        }
        
        // If expired, update status and create new subscription
        await Subscription.findByIdAndUpdate(
            currentSubscription._id,
            { status: 'expired' }
        );
    }
    
    // Create new subscription
    const newSubscription = await Subscription.create({
        user: req.user.id,
        plan: req.body.plan,
        startDate: req.body.startDate || new Date(),
        expiryDate: req.body.expiryDate,
        status: 'active',
        ...req.body
    });
    
    res.status(201).json({
        success: true,
        data: newSubscription,
        message: 'New subscription plan created successfully'
    });
});
