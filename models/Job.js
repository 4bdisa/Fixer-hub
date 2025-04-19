import mongoose from "mongoose";
const jobSchema = new mongoose.Schema({
    description: { type: String, required: true },
    category: { type: [String], required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'completed'], default: 'pending' },
    proposedPrice: Number,
    // createdAt: { type: Date, default: Date.now } later to be removed if it doesn't work
  },{ timestamps: true });

  export default mongoose.model("Job", jobSchema);