import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who posted the job
    category: { type: String, required: true }, // Example: "Electronics Repair"
    description: { type: String, required: true }, // Detailed description
    keywords: [String], // List of keywords (e.g., ["TV", "Phone", "Laptop"])
    location: {
      type: { type: String, default: "Point", enum: ["Point"] },
      coordinates: [Number], // [longitude, latitude]
    },
    budget: { type: Number }, // Optional budget
    isFixedPrice: { type: Boolean, default: false }, // Fixed price or hourly
    status: { type: String, enum: ["open", "in-progress", "completed"], default: "open" }, // Job status
  },
  { timestamps: true }
);

// Create a geospatial index for location-based search
serviceRequestSchema.index({ location: "2dsphere" });

export default mongoose.model("ServiceRequest", serviceRequestSchema);
