const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serverNumber: {
        type: String,
        required: true
    },
    recipient: {
        type: String,
        required: true
    },
    apiId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'failed', 'pending'],
        default: 'pending'
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
messageSchema.methods.toJSON = function () {
    const message = this;
    const messageObject = message.toObject();

    delete messageObject.__v;

    return messageObject;
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;