import express from "express";
import Job from "../models/Job.js";
import User from "../models/user.js";
import {authenticate} from "../middleWares/authMiddleware.js"; // Import the authentication middleware

const router = express.Router();

// Step 1-6: Create job and fetch sorted providers
router.post("/jobs/create", authenticate, async (req, res) => {
  try {
    const { description, category, customerLocation, maxPrice, sortBy } = req.body;
    const customer = req.user;

    // Ensure customer is defined
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
    // Step 4: Find providers matching the category
    const baseQuery = {
      role: "service_provider",
      skills: { $in: Array.isArray(category) ? category : [category] },
    };

    // Step 5: Add location filter if provided
    if (customerLocation) {
      baseQuery.location = {
        $near: {
          $geometry: { type: "Point", coordinates: customerLocation },
          $maxDistance: 10000 // in meters
        }
      };
    }

    const rawProviders = await User.find(baseQuery);

    // Step 5: Filter by price
    let providers = rawProviders;
    if (maxPrice) {
      providers = providers.filter(p => p.hourlyRate && p.hourlyRate <= maxPrice);
    }

    // Step 5: Sort
    if (sortBy === "completedJobs") {
      providers.sort((a, b) => b.completedJobs - a.completedJobs);
    } else if (sortBy === "hourlyRate") {
      providers.sort((a, b) => (a.hourlyRate ?? Infinity) - (b.hourlyRate ?? Infinity));
    }

    res.status(200).json({
      jobId: newJob._id,
      providers,
    });
  } catch (err) {
    console.error(err);
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
