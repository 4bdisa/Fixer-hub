import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportType: {
        type: String,
        enum: ['scam', 'harassment', 'inappropriate', 'other'],
        required: true
    },
    comment: { type: String, maxlength: 500 },
    createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);

export default Report;