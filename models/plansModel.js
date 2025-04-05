const mongoose = require('mongoose');

// Define the feature schema
const featureSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    }
});

// Define the plan schema
const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: String,
        required: true,
        trim: true
    },
    numericPrice: {
        type: Number,
        required: true
    },
    period: {
        type: String,
        required: true,
        enum: ['month', 'year', 'one-time'],
        default: 'month'
    },
    icon: {
        type: String,
        enum: ['zap', 'star', 'crown', null],
        default: null
    },
    color: {
        type: String,
        default: 'from-gray-500 to-gray-600'
    },
    features: [featureSchema],
    monthlylimit: {
        type: Number,
        default: 0
    },
    maxMessages: {
        type: Number,
        default: 0
    },
    recommended: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create a virtual property for calculating end date
planSchema.virtual('endDate').get(function() {
    // Implementation would depend on subscription logic
    return null;
});

// Pre-save middleware to update the updatedAt field
planSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Extract numeric price from price string (removing currency symbol)
    if (this.price) {
        const numericString = this.price.replace(/[^\d.]/g, '');
        this.numericPrice = parseFloat(numericString);
    }
    
    next();
});

// Create the model from the schema
const Plan = mongoose.model('Plan', planSchema);

// Seed data for initial plans based on AVAILABLE_PLANS
const seedPlans = [
    {
        name: "Starter",
        price: "₹499",
        numericPrice: 499,
        period: "month",
        icon: "zap",
        color: "from-blue-500 to-blue-600",
        features: [
            { text: "1,000 messages per month" },
            { text: "Basic support" },
            { text: "Standard templates" },
            { text: "Email notifications" },
            { text: "Basic analytics" }
        ],
        recommended: false
    },
    {
        name: "Pro",
        price: "₹999",
        numericPrice: 999,
        period: "month",
        icon: "star",
        color: "from-purple-500 to-purple-600",
        features: [
            { text: "10,000 messages per month" },
            { text: "Priority support" },
            { text: "Advanced analytics" },
            { text: "Custom templates" },
            { text: "API access" }
        ],
        recommended: true
    },
    {
        name: "Enterprise",
        price: "₹2,999",
        numericPrice: 2999,
        period: "month",
        icon: "crown",
        color: "from-yellow-500 to-yellow-600",
        features: [
            { text: "Unlimited messages" },
            { text: "24/7 dedicated support" },
            { text: "Advanced analytics" },
            { text: "Custom templates" },
            { text: "API access" },
            { text: "Custom integrations" },
            { text: "Dedicated account manager" }
        ],
        recommended: false
    }
];

module.exports = {
    Plan,
    seedPlans
};