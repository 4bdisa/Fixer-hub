import express from "express";
import Job from "../models/Job.js";
import User from "../models/user.js";
import { authenticate } from "../middleWares/authMiddleware.js"; // Import the authentication middleware
import ServiceRequest from "../models/ServiceRequest.js";

const router = express.Router();

// Step 1-6: Create job and fetch sorted providers
router.post("/jobs/create", authenticate, async (req, res) => {
  try {
    const { description, category, customerLocation } = req.body;
    const customer = req.user;

    if (!customer) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Create job
    const newJob = await Job.create({
      description,
      category,
      customer: customer._id,
      postedBy: customer.email,
    });

    // Find providers matching the category
    const baseQuery = {
      role: "service_provider",
      skills: { $in: Array.isArray(category) ? category : [category] },
    };

    if (customerLocation) {
      baseQuery.location = {
        $near: {
          $geometry: { type: "Point", coordinates: customerLocation },
          $maxDistance: 10000, // in meters
        },
      };
    }


    const rawProviders = await User.find(baseQuery);
    

    res.status(200).json({
      jobId: newJob._id,
      providers: rawProviders,
    });
  } catch (err) {
    console.error("Error in /jobs/create:", err);
    res.status(500).json({ error: "Job creation or provider lookup failed." });
  }
});

// Step 7: Customer selects a provider
router.post("/select-provider", async (req, res) => {
  try {
    const { jobId, providerId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    if (!job.customer.equals(req.user._id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    job.provider = providerId;
    job.status = "pending"; // or update to "waiting_for_acceptance", etc.
    await job.save();

    res.status(200).json({ success: true, message: "Provider selected successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Provider selection failed." });
  }
});

export default router;
