const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Customer schema
const customerSchema = new Schema({
  customer_id: {
    type: String,
    required: true,
    unique: true, // Ensures each customer has a unique ID
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
    unique: true, // Ensures phone numbers are not duplicated
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures email is unique
    match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, // Basic email validation
  },
  country: {
    type: String,
    required: true,
  },
  profile_picture: {
    type: String, // Stores a URL or file path for the profile picture
    required: false, // Optional field
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create a model from the schema
const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
