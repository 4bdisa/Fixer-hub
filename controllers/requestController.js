import jwt from "jsonwebtoken";
import ServiceRequest from "../models/serviceRequest.js";
import User from "../models/user.js";

// Controller to create a new service request

export const searchProviders = async (req, res) => {
  try {
    const { description, category, customerLocation } = req.body;

    if (!category || !customerLocation) {
      return res.status(400).json({ error: "Category and customer location are required." });
    }

    // Build the query to find providers
    const query = {
      role: "service_provider", // Assuming service providers have this role
      skills: { $in: Array.isArray(category) ? category : [category] }, // Match skills with the category
    };

    // Add location-based filtering if customerLocation is provided
    if (customerLocation) {
      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: customerLocation }, // [longitude, latitude]
          $maxDistance: 10000, // 10 km radius
        },
      };
    }

    // Query the database for matching providers
    const providers = await User.find(query).select("name email rating hourlyRate completedJobs");

    // Return the providers
    res.status(200).json({ success: true, providers });
  } catch (error) {
    console.error("Error searching providers:", error);
    res.status(500).json({ error: "Failed to search providers. Please try again later." });
  }
};

export const selectProvider = async (req, res) => {
  try {
    const { providerId, description, category, location, budget, isFixedPrice } = req.body;

    const customer = req.user;
    if (!customer) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    // Create a service request directly
    const newRequest = await ServiceRequest.create({
      customer: customer._id,
      providerId,
      category,
      description,
      location,
      budget,
      isFixedPrice,
      status: "pending",
    });

    res.status(200).json({
      success: true,
      message: "Service request created successfully.",
      request: newRequest,
    });
  } catch (err) {
    console.error("Error in /select-provider:", err);
    res.status(500).json({ error: "Failed to create service request." });
  }
};

export const createRequest = async (req, res) => {
  try {
    const { category, description, providerId, location, budget, isFixedPrice } = req.body;

    if (!providerId) {
      return res.status(400).json({ success: false, message: "Provider ID is required" });
    }

    const newRequest = await ServiceRequest.create({
      customer: req.user._id,
      providerId, // Ensure this is correctly set
      category,
      description,
      location,
      budget,
      isFixedPrice,
      status: "pending",
    });
    console.log("New service request created:", newRequest); // Debugging
    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    console.error("Error creating service request:", error);
    res.status(500).json({ success: false, message: error.message });
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

    const requests = await ServiceRequest.find({ providerId, status: "pending" }).populate("customer", "name email");

    if (!requests || requests.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ success: false, message: "Failed to fetch requests." });
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

    res.status(200).json({ success: true, message: `Request ${status} successfully`, data: request });
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ success: false, message: "Failed to update request status" });
  }
};

export const getJobHistory = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming the user is authenticated and their ID is available

    // Fetch requests for the user and populate provider details
    const requests = await ServiceRequest.find({ customer: userId })
      .populate("providerId", "name photo") // Populate the provider's name and photo
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching job history:", error);
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