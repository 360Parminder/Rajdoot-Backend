const mongoose = require('mongoose');

const waitListSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const WaitList = mongoose.model('WaitList', waitListSchema);

module.exports = WaitList;