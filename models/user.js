import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["client", "service_provider"], required: true },
  profileImage: { type: String },
  location: {
    type: { type: String, default: "Point", enum: ["Point"] },
    coordinates: [Number], // [longitude, latitude]
  },
  skills: [String],
  keywords: [String],
  rating: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  experienceYears: { type: Number, default: 0 },
  homeService: { type: Boolean, default: false },
  workDays: [String],
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });
// Check if the model is already defined
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;