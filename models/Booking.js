import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Client who books the service
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Service provider
    serviceRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true }, // Linked service request
    status: {
      type: String,
      enum: ["pending", "accepted", "in-progress", "completed", "rejected"],
      default: "pending",
    }, // Booking status
    price: { type: Number, required: true }, // Price agreed for the service
    scheduledDate: { type: Date, required: true }, // When the service is scheduled
    location: {
      type: { type: String, default: "Point", enum: ["Point"] },
      coordinates: [Number], // [longitude, latitude]
    },
  },
  { timestamps: true } // Adds createdAt & updatedAt
);

// Create a geospatial index for location-based bookings
bookingSchema.index({ location: "2dsphere" });

export default mongoose.model("Booking", bookingSchema);
