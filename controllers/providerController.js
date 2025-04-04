import User from "../models/user.js";

export const matchProviders = async (req, res) => {
  try {
    const { keywords, location, maxDistance, sortBy } = req.query;

    if (!keywords || !location) {
      return res.status(400).json({ message: "Keywords and location are required" });
    }

    const keywordArray = keywords.split(","); // Convert "TV,Phone" → ["TV", "Phone"]
    const [longitude, latitude] = location.split(",").map(Number); // Extract coordinates

    // Geospatial query to find nearby providers
    let query = {
      skills: { $in: keywordArray }, // Match providers with relevant skills
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: maxDistance ? parseInt(maxDistance) : 10000, // Default: 10km
        },
      },
      isVerified: true, // Only verified providers
    };

    // Fetch matching providers
    let providers = await User.find(query).select("-password");

    // Apply advanced ranking algorithm
    providers = providers.map(provider => {
      let score = 0;

      // 🔥 Priority Boosts:
      score += provider.rating * 3; // ⭐ Higher rating = Higher priority
      score += provider.completedJobs * 2; // 💼 More jobs completed = More experience
      score += provider.isVerified ? 5 : 0; // ✅ Verified providers get a boost

      return { ...provider.toObject(), score };
    });

    // Sort by highest score first
    providers.sort((a, b) => b.score - a.score);

    res.status(200).json({ success: true, providers });
  } catch (error) {
    console.error("Error in matchProviders:", error);
    res.status(500).json({ message: "Server error" });
  }
};
