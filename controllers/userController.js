import User from "../models/user.js";

// Get User Profile
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json(user);
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.user.userId, req.body, { new: true }).select("-password");
  res.status(200).json(updatedUser);
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

