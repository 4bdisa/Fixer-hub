import User from "../models/user.js";

// Get User Profile
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json(user);
};

// Update Service Provider Profile
export const updateServiceProviderProfile = async (req, res) => {
  try {
    const { skills, keywords, country, workDays, experienceYears, homeService } = req.body;

    // Ensure the user is a service provider
    if (req.user.role !== "service_provider") {
      return res.status(403).json({ message: "Access denied. Only service providers can update their profile." });
    }

    // Prepare the update object
    const updateData = {
      ...(skills && { skills: Array.isArray(skills) ? skills : skills.split(",").map(skill => skill.trim()) }),
      ...(keywords && { keywords: Array.isArray(keywords) ? keywords : keywords.split(",").map(keyword => keyword.trim()) }),
      ...(country && { country }),
      ...(workDays && { workDays: Array.isArray(workDays) ? workDays : workDays.split(",").map(day => day.trim()) }),
      ...(experienceYears !== undefined && { experienceYears: parseInt(experienceYears, 10) }),
      ...(homeService !== undefined && { homeService: Boolean(homeService) }),
    };

    // Update the user's profile
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "An error occurred while updating the profile." });
  }
};



// Get FH Coins
export const getFhCoins = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("fhCoins");
    res.json({ fhCoins: user.fhCoins });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch fh-coin balance" });
  }
};

