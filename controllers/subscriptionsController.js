const User = require("../models/userModel");
const AppError = require("../utils/appError");

exports.renewSubscription = async (req, res, next) => {
    const { plan } = req.body;
    console.log('Renewing subscription with plan:', plan);
    
    
    // Check if plan data is provided
    if (!plan) {
        return next(new AppError('Please provide a plan to subscribe to', 400));
    }

    // Get current user with active subscription if exists
    const user = await User.findOne({
        _id: req.user.id,
        'plan.status': 'active'
    }).populate('plan.plans.planId');

    const now = new Date();
    
    // If user has an active subscription
    if (user && user.plan.status === 'active') {
        // Check if any plan is still active (not expired)
        const activePlan = user.plan.plans.find(p => new Date(p.expiryDate) > now);
        
        if (activePlan) {
            // Update existing plan
            const updatedPlans = user.plan.plans.map(p => {
                if (p._id.equals(activePlan._id)) {
                    return {
                        ...p.toObject(),
                        planId: plan._id,
                        startDate: now,
                        expiryDate: new Date(now.getTime() + 360 * 24 * 60 * 60 * 1000) // 360 days from now
                    };
                }
                return p;
            });

            user.plan.plans = updatedPlans;
            await user.save();

            return res.status(200).json({
                status: 'success',
                data: user,
                message: 'Subscription plan updated successfully'
            });
        }
        
        // If all plans are expired, update status to inactive
        user.plan.status = 'inactive';
        await user.save();
    }

    // Create new subscription plan
    const newPlan = {
        planId: plan._id,
        startDate: now,
        expiryDate: new Date(now.getTime() + 360 * 24 * 60 * 60 * 1000) // 360 days from now
    };

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            $set: {
                'plan.status': 'active',
                'plan.plans': [...(user?.plan?.plans || []), newPlan]
            }
        },
        {
            new: true,
            runValidators: true
        }
    ).populate('plan.plans.planId');

    res.status(201).json({
        status: 'success',
        data: updatedUser,
        message: 'New subscription plan created successfully'
    });
};