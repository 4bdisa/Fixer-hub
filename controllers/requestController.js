import jwt from "jsonwebtoken";
import ServiceRequest from "../models/serviceRequest.js";
import User from "../models/user.js";

// Controller to create a new service request
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
      return res.status(404).json({ message: "No requests found for this provider" });
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
    const { requestId } = req.params;
    const { status } = req.body;

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

    // Update the status
    request.status = status;
    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};