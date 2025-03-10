
const mongoose = require('mongoose');

const apiSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please fill your userId']
    },
    keyId: {
        type: String,
        required: [true, 'Please fill your keyId']
    },
    secretKey: {
        type: String,
        required: [true, 'Please fill your secretKey']
    },
    role: {
        type: String,
        enum: ['admin', 'developer', 'tester', 'user'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const Api = mongoose.model('Api', apiSchema);

module.exports = Api;

