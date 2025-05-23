import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["client", "service_provider"], required: true },
  profileImage: { type: String },
  location: {
    type: { type: String, default: "Point", enum: ["Point"] }, coordinates: {
      type: [Number], // [longitude, latitude]
    }, // [longitude, latitude]
  },

  skills: [String],
  keywords: [String],
  completedJobs: { type: Number, default: 0 },
  experienceYears: { type: Number, default: 0 },
  phoneNumber: { type: Number, default: 0 },
  country: { type: String, default: 0 },
  homeService: { type: Boolean, default: false },
  workDays: [String],
  fhCoins: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: true },
  availability: { type: Boolean, default: true },
  
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });
// Check if the model is already defined
export default mongoose.model("User", userSchema);