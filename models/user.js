import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  role: { type: String, enum: ["client", "service_provider"], default: "service_provider" },
  skills: [String],
  keywords: [String],
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
  rating: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  profileImage: String,

  // New attributes
  country: { type: String }, 
  workDays: [{ type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] }], 
  experienceYears: { type: Number, min: 0, default: 0 }, 
  homeService: { type: Boolean, default: false } 

}, { timestamps: true });

// Create a geospatial index
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
