import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

// Define the ServiceProvider schema
const serviceProviderSchema = new Schema({
  provider_id: {
    type: String,
    required: true, // You can make this required, depending on your app's needs
    unique: true,   // Ensures each provider has a unique ID
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
    unique: true, // You can also enforce uniqueness if phone numbers should not be duplicated
  },
  email: {
    type: String,
    required: true,
    unique: true, // Unique email for each service provider
    match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, // Basic email validation
  },
  country: {
    type: String,
    required: true,
  },
  profile_picture: {
    type: String,  // This will store the URL or path of the profile picture
    required: false,
  },
  work_days: {
    type: [String], // Array to store multiple days like ["Monday", "Wednesday"]
    required: true,
  },
  experience_years: {
    type: Number,
    required: true,
    min: 0,  // Ensure no negative experience years
  },
  home_service: {
    type: Boolean,
    required: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create a model from the schema
const ServiceProvider = model('ServiceProvider', serviceProviderSchema);

export default ServiceProvider;
