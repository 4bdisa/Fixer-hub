// import User from "../models/user.js";

// // Matching Algorithm for Service Providers
// export const matchServiceProviders = async (req, res) => {
//   const { keywords, location, maxDistance, sortBy } = req.query;

//   const filters = {
//     role: "service_provider",
//     isVerified: true,
//   };

//   // Match by Keywords (TV, Phones, Laptops, etc.)
//   if (keywords) {
//     filters.keywords = { $in: keywords.split(",") };
//   }

//   // Geospatial Location-based Search (if location is provided)
//   if (location) {
//     const [lng, lat] = location.split(","); // Format: longitude, latitude

//     filters.location = {
//       $near: {
//         $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
//         $maxDistance: maxDistance || 10000, // Default max distance: 10km
//       },
//     };
//   }

//   let sortOption = {};

//   // Sort by Rating or Location or Price
//   if (sortBy === "rating") {
//     sortOption.rating = -1;
//   } else if (sortBy === "location") {
//     sortOption["location"] = 1;
//   }

//   const serviceProviders = await User.find(filters).sort(sortOption);

//   res.status(200).json(serviceProviders);
// };





import ServiceRequest from "../models/ServiceRequest.js";
import User from "../models/user.js";

// Function to find matching service providers
export const matchServiceProviders = async (req, res) => {
  try {
    const { serviceRequestId, sortBy } = req.query; // Get job ID & sorting preference

    // Find the service request by ID
    const serviceRequest = await ServiceRequest.findById(serviceRequestId);
    if (!serviceRequest) return res.status(404).json({ message: "Service request not found" });

    // Extract job details
    const { keywords, location } = serviceRequest;

    // Find service providers matching the job's keywords
    let providers = await User.find({
      role: "service_provider",
      keywords: { $in: keywords }, // Match at least one keyword
      isVerified: true, // Only show verified providers
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: location.coordinates }, // Find nearby providers
          $maxDistance: 500000, // 500km radius
        },
      },
    });

    // Sort providers based on user preference
    if (sortBy === "rating") {
      providers = providers.sort((a, b) => b.rating - a.rating); // Highest rating first
    } else if (sortBy === "price" && serviceRequest.isFixedPrice) {
      providers = providers.sort((a, b) => a.price - b.price); // Lowest price first
    }

    res.status(200).json(providers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
