import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  budget: {
    type: Number,
  },
  isFixedPrice: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "accepted",
      "declined",
      "ongoing",
      "completed",
      "cancelled",
    ],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  media: [
    {
      type: String, // Array of strings to store Cloudinary URLs
    },
  ], // Add the media field
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
  },
  paid: {
    type: Boolean,
    default: false,
  },
});

const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);

export default ServiceRequest;