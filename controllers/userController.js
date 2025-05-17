import User from "../models/user.js";

// Function to capitalize the first letter of a string
const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

// Update Service Provider Profile
export const updateServiceProviderProfile = async (req, res) => {
  try {
    const {
      skills,
      keywords,
      country,
      workDays,
      experienceYears,
      phoneNumber,
      homeService,
    } = req.body;

    // Ensure the user is a service provider
    if (req.user.role !== "service_provider") {
      return res
        .status(403)
        .json({
          message:
            "Access denied. Only service providers can update their profile.",
        });
    }

    // Prepare the update object
    const updateData = {
      ...(skills && {
        skills: Array.isArray(skills)
          ? skills.map(skill => capitalizeFirstLetter(skill)) // Capitalize first letter of skills
          : skills.split(",").map((skill) => capitalizeFirstLetter(skill.trim())), // Capitalize first letter of skills
      }),
      ...(keywords && {
        keywords: Array.isArray(keywords)
          ? keywords.map(keyword => capitalizeFirstLetter(keyword)) // Capitalize first letter of keywords
          : keywords.split(",").map((keyword) => capitalizeFirstLetter(keyword.trim())), // Capitalize first letter of keywords
      }),
      ...(country && { country: capitalizeFirstLetter(country) }), // Capitalize first letter of country
      ...(workDays && {
        workDays: Array.isArray(workDays)
          ? workDays.map(day => capitalizeFirstLetter(day)) // Capitalize first letter of workDays
          : workDays.split(",").map((day) => capitalizeFirstLetter(day.trim())), // Capitalize first letter of workDays
      }),
      ...(experienceYears !== undefined && {
        experienceYears: parseInt(experienceYears, 10),
      }),
      ...(phoneNumber !== undefined && {
        phoneNumber: phoneNumber,
      }),
      ...(homeService !== undefined && { homeService: Boolean(homeService) }),
    };

    // Update the user's profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({
        message: "An error occurred while updating the profile.",
        error: error.message,
      });
  }
};

// Get FH Coins
export const getFhCoins = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("fhCoins");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ fhCoins: user.fhCoins });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch fh-coin balance" });
  }
};

export const searchProviders = async (req, res) => {
  try {
    const { description, category, customerLocation, media } = req.body; // Include media

    

    // ... existing search logic ...

    const providers = await User.find({
      role: "service_provider",
      // ... other search criteria ...
    });

    

    res.status(200).json({ success: true, providers });
  } catch (error) {
    console.error("Error searching providers:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to search providers" });
  }
};

