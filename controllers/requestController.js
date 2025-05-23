import ServiceRequest from '../models/ServiceRequest.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import Review from "../models/Review.js"; // Import the Review model

// Controller to create a new service request

export const searchProviders = async (req, res) => {
  try {
    const { description, category, customerLocation } = req.body;

    if (!category || !customerLocation) {
      return res.status(400).json({ error: "Category and customer location are required." });
    }

    const [longitude, latitude] = customerLocation;

    // Use $geoNear to calculate distance
    const providers = await User.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] }, // Customer's live location
          distanceField: "distance", // Calculate distance
          spherical: true,
        },
      },
      {
        $match: {
          role: "service_provider",
          skills: { $in: Array.isArray(category) ? category : [category] },
          availability: true,
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          rating: 1,
          hourlyRate: 1,
          completedJobs: 1,
          experience: 1, // Ensure this field is included
          distance: 1,
        },
      },
    ]);


    res.status(200).json({ success: true, providers });
  } catch (error) {
    console.error("Error searching providers:", error);
    res.status(500).json({ error: "Failed to search providers. Please try again later." });
  }
};

export const selectProvider = async (req, res) => {
  try {
    const { providerId, description, category, location, budget, isFixedPrice, media } = req.body;

    // Ensure the customer is authenticated
    const customer = req.user;
    if (!customer) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Create a service request using the customer's ID from the auth token
    const newRequest = await ServiceRequest.create({
      customer: customer._id, // Use the customer's ID from the token
      providerId,
      category,
      description,
      location,
      budget,
      isFixedPrice,
      status: "pending",
      media: media || [] // Initialize media as an empty array
    });

    // Respond with the new request
    res.status(201).json({
      message: "Service request created successfully!",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error creating service request:", error);
    res.status(500).json({
      error: "Failed to create service request",
      details: error.message,
    });
  }
};

// Create a new service request
export const createRequest = async (req, res) => {
  try {
    const { providerId, description, category, location, budget, isFixedPrice, media } = req.body; // Include media

    

    const newRequest = new ServiceRequest({
      customer: req.user._id,
      providerId,
      description,
      category,
      location,
      budget,
      isFixedPrice,
      media: media || [], // Save the media URLs
    });

    const savedRequest = await newRequest.save();
    

    res.status(201).json({ success: true, request: savedRequest });
  } catch (error) {
    console.error("Error creating service request:", error);
    res.status(500).json({ success: false, message: "Failed to create service request" });
  }
};

export const getRequestsForProvider = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const providerId = decoded.id;

    if (!providerId) {
      return res.status(400).json({ message: "Invalid token. Provider ID is missing." });
    }

    
    const requests = await ServiceRequest.find({ providerId, status: "pending" }).populate("customer", "name email profileImage").populate('media');
    

    if (!requests || requests.length === 0) {
      return res.status(404).json({ message: "No requests found for this provider" });
    }

    res.status(200).json({
      message: "Successfully retrieved requests for provider",
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

export const getRequests = async (req, res) => {
  try {
    const { providerId } = req.query; // Extract providerId from query parameters

    if (!providerId) {
      return res.status(400).json({ message: "Provider ID is required" });
    }

    const requests = await ServiceRequest.find({ providerId }).populate("customer", "name email");

    if (!requests || requests.length === 0) {
      return res.status(404).json({ message: "No requests found for this provider" });
    }

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching requests:", error); // Debugging
    res.status(500).json({ success: false, message: error.message });
  }
};

// Controller to update the status of a service request
export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params; // Get requestId from the URL parameters
    const { status } = req.body; // Get the status from the request body

    // Ensure the status is valid
    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const request = await ServiceRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Ensure the request is still pending
    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "Request is no longer pending" });
    }

    // Update the status based on the user's confirmation
    request.status = status;
    await request.save();

    // Update the provider's availability based on the status
    const provider = await User.findById(request.providerId);
    if (provider) {
      provider.availability = status === "accepted" ? false : true; // Set availability based on status
      await provider.save();
    }

    res.status(200).json({ success: true, message: `Request ${status} successfully`, data: request });
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ success: false, message: "Failed to update request status" });
  }
};

export const getJobHistory = async (req, res) => {
  try {
    const userId = req.user._id; // Ensure `req.user` is populated by the `authenticate` middleware
    const requests = await ServiceRequest.find({ customer: userId })
      .populate("providerId", "name photo phoneNumber") // Populate provider details
      .populate("reviewId", "rating comment") // Populate review details
      .sort({ updatedAt: -1 }); // Sort by most recently updated
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching job history:", error);
    res.status(500).json({ success: false, message: "Failed to fetch job history" });
  }
};

export const getProviderJobHistory = async (req, res) => {
  try {
    const providerId = req.user._id; // Ensure `req.user` is populated by the `authenticate` middleware
    const requests = await ServiceRequest.find({ providerId })
      .populate("customer", "name photo") // Populate customer details
      .populate("reviewId", "rating comment") // Populate review details
      .sort({ updatedAt: -1 }); // Sort by most recently updated


    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching provider job history:", error);
    res.status(500).json({ success: false, message: "Failed to fetch job history" });
  }
};

export const getAcceptedRequestsByProvider = async (req, res) => {
  try {
    const providerId = req.user._id; // Assuming the provider is authenticated and their ID is available

    // Fetch requests where the providerId matches and the status is "accepted"
    const requests = await ServiceRequest.find({ providerId, status: "accepted" })
      .populate("customer", "name email") // Populate customer details
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching accepted requests:", error);
    res.status(500).json({ success: false, message: "Failed to fetch accepted requests" });
  }
};


// Delete a service request
export const deleteRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Find the request by ID
    const request = await ServiceRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Ensure the authenticated user is the owner of the request
    if (request.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this request" });
    }

    // Update the provider's availability to true
    const provider = await User.findById(request.providerId);
    if (provider) {
      provider.availability = true;
      await provider.save();
    }

    // Delete the request
    await request.deleteOne();

    res.status(200).json({ success: true, message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ success: false, message: "Failed to delete the request" });
  }
};

export const completeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rating, comment } = req.body;

    // Validate required fields
    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Rating is required."
      });
    }

    // Find the request
    const request = await ServiceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found."
      });
    }

    // Authorization check
    if (request.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to complete this request."
      });
    }

    // Create review
    const newReview = await Review.create({
      userId: req.user._id,
      providerId: request.providerId, // Added provider reference
      serviceRequestId: requestId,    // Added request reference
      rating,
      comment: comment || "No comment provided.",
    });

    // Update the service request
    request.status = "completed";
    request.reviewId = newReview._id;
    await request.save();

    // Update provider's status and stats
    const provider = await User.findById(request.providerId);
    if (provider) {
      provider.available = true;      // Set available to true
      provider.availability = true;   // Maintain backward compatibility
      provider.completedJobs = (provider.completedJobs || 0) + 1;
      await provider.save();
    }

    res.status(200).json({
      success: true,
      message: "Request completed successfully.",
      data: {
        request,
        review: newReview
      }
    });
  } catch (error) {
    console.error("Error completing request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete request.",
      error: error.message
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await User.aggregate([
      { $match: { role: "service_provider" } }, // Only service providers
      { $unwind: "$skills" }, // Unwind the skills array
      { $group: { _id: "$skills" } }, // Group by skill
      { $project: { _id: 0, category: "$_id" } }, // Format the response
    ]);

    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Failed to fetch categories." });
  }
};

export const getRequestCount = async (req, res) => {
  try {
    const count = await ServiceRequest.countDocuments({
      providerId: req.user.id,
      status: "pending", // Only count pending requests
    });

    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Error fetching request count:", error);
    res.status(500).json({ success: false, message: "Failed to fetch request count." });
  }
};


// controllers/requestController.js



export const markAsPaidAndGetContact = async (req, res) => {
  const requestId = req.params.id;
  const userId = req.user._id; // Assuming passport is used for authentication

  try {
    const request = await ServiceRequest.findById(requestId).populate("providerId");

    if (!request) return res.status(404).json({ message: "Request not found" });
    if (String(request.customer) !== String(userId))
      return res.status(403).json({ message: "Not authorized" });

    if (request.paid)
      return res.status(200).json({
        contact: request.providerId.phoneNumber,
        message: "Already paid",
      });

    const user = await User.findById(userId);
    if (user.fhCoins < 5)
      return res.status(400).json({ message: "Insufficient FH-Coins" });

    user.fhCoins -= 5;
    request.paid = true;

    await user.save();
    await request.save();

    return res.status(200).json({
      contact: request.providerId.phoneNumber,
      message: "Contact information retrieved successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
