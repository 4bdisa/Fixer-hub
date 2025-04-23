import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    location: {
      type: { type: String, default: "Point", enum: ["Point"] },
      coordinates: [Number], // [longitude, latitude]
    },
    budget: { type: Number },
    isFixedPrice: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
  },
  { timestamps: true }
);

// Create a geospatial index for location-based search
serviceRequestSchema.index({ location: "2dsphere" });

export default mongoose.model("ServiceRequest", serviceRequestSchema);
