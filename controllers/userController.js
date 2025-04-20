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

export const suggestServiceProviders = async (req, res) => {
  try {
    const { keywords, longitude, latitude } = req.body;

    // Validate input
    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({ message: "Please provide valid keywords array" });
    }
    if (!longitude || !latitude) {
      return res.status(400).json({ message: "Please provide valid longitude and latitude" });
    }

    // Convert coordinates to numbers
    const clientLongitude = parseFloat(longitude);
    const clientLatitude = parseFloat(latitude);

    // Validate coordinates
    if (isNaN(clientLongitude) || isNaN(clientLatitude)) {
      return res.status(400).json({ message: "Invalid longitude or latitude values" });
    }

    // Find nearby service providers
    const providers = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [clientLongitude, clientLatitude],
          },
          distanceField: "distance", // Adds a 'distance' field to each document
          spherical: true, // Use spherical geometry for Earth-like calculations
          maxDistance: 10000, // Optional: Limit to 10km radius (in meters)
        },
      },
      {
        $match: {
          role: "service_provider",
          keywords: { $in: keywords.map(k => new RegExp(k, 'i')) },
          isVerified: true,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          profileImage: 1,
          rating: 1,
          skills: 1,
          distance: 1, // Include distance in the response
        },
      },
      {
        $sort: {
          distance: 1, // Sort by nearest first
          rating: -1,  // Then by highest rating
        },
      },
      { $limit: 10 },
    ]);

    // Format the response
    const suggestions = providers.map(provider => ({
      id: provider._id,
      name: provider.name,
      profileImage: provider.profileImage,
      rating: provider.rating,
      skills: provider.skills.slice(0, 3), // Show top 3 skills
      distance: provider.distance, // Distance in meters
    }));

    res.status(200).json(suggestions);
  } catch (error) {
    console.error("Error suggesting providers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

