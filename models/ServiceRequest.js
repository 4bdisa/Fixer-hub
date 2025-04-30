import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["pending", "accepted", "declined", "completed"], default: "pending" },
  reviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Review" }, // Reference to the Review schema
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);

export default ServiceRequest;