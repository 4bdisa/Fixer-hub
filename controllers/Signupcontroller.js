import User from "../models/user.js"; // Assuming this is the path to the User model
import passport from "passport";


// Controller to handle Google OAuth login and signup as service provider
export const signupServiceProvider = async (req, res) => {
  try {
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, async () => {
      // Step 2: After Google authentication, check if user already exists
      const user = await User.findOne({ email: req.user.email });

      if (!user) {
        // If no user exists, create a new service provider user
        const newUser = new User({
          name: req.user.displayName,
          email: req.user.email,
          profileImage: req.user.photos ? req.user.photos[0].value : "",
          role: "service_provider", // Automatically assign the role as service_provider
          isVerified: true, // Optionally mark as verified
        });

        // Save the new user to the database
        await newUser.save();

        // Return the newly created user
        return res.status(201).json({ message: "User created successfully", user: newUser });
      } else {
        // If the user already exists, return existing user data
        return res.status(200).json({ message: "User already exists", user });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred during the signup process" });
  }
};
// Controller for updating service provider's profile (skills, keywords, workDays, etc.)
export const completeServiceProviderProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { skills, keywords, country, workDays, experienceYears, homeService } = req.body;

    // Step 1: Prepare the update object for the user
    const updateData = {
      skills,
      keywords,
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
