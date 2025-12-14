const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
    originalText: {
        type: String,
        required: true,
    },
    translatedText: {
        type: String,
        required: true,
    },
    tone: {
        type: String,
        required: true,
    },
    context: {
        type: String,
        default: 'Email',
    },
    audience: {
        type: String,
        default: 'Peer',
    },
    feedback: {
        type: Number, // 1 for Like, -1 for Dislike, 0 for None
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Translation', translationSchema);
