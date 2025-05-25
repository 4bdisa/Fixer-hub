import User from "../models/user.js"; // Assuming this is the path to the User model
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';


// Controller for updating service provider's profile (skills, keywords, workDays, etc.)
export const completeServiceProviderProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { skills, country, workDays, experienceYears, homeService } = req.body;
    // Step 1: Prepare the update object for the user
    const updateData = {
      skills,
      
      country,
      workDays,
      experienceYears,
      homeService,
    };

    // Step 2: Update the user profile without the profile image
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData, // Use the updateData object to update the user
      { new: true } // Return the updated document
    );

    // If no user found
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 3: Return the updated user profile
    return res.status(200).json({
      message: "Profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred while updating the profile" });
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // From Google Cloud Console

export const completeServiceProvider = async (req, res) => {
  const { token, password, skills, location, experienceYears } = req.body;

  try {
    // 🔐 1. Verify Google token (NOT your JWT_SECRET!)
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture: image } = payload; // Google uses 'picture', not 'image'

    
    // 🧠 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // 🔑 3. Hash password (if required)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 👤 4. Create new user
    const newUser = new User({
      name,
      email,
      image, // Or 'picture' if your schema uses that
      password: hashedPassword,
      role: 'service_provider',
      skills,
      location,
      experienceYears,
    });

    await newUser.save();

    // 🔐 5. Log in the user (if using sessions)
    req.logIn(newUser, (err) => {
      if (err) return res.status(500).json({ message: 'Login after signup failed' });
      res.status(201).json({ message: 'User created and logged in', user: newUser });
    });

  } catch (error) {
    console.error('Error completing registration:', error);
    res.status(400).json({ 
      message: 'Invalid Google token or registration error',
      error: error.message 
    });
  }
};

export default { completeServiceProviderProfile, completeServiceProvider };