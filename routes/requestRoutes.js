import express from "express";
import { createRequest, getRequestsForProvider, updateRequestStatus, getRequests, getJobHistory, getProviderJobHistory } from "../controllers/requestController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { deleteRequest } from "../controllers/requestController.js";
import { searchProviders, selectProvider } from "../controllers/requestController.js";
import { getAcceptedRequestsByProvider } from "../controllers/requestController.js";
import { completeRequest, getCategories } from "../controllers/requestController.js";
import { getRequestCount } from "../controllers/requestController.js";
import { markAsPaidAndGetContact } from "../controllers/requestController.js";
const router = express.Router();

router.post("/search-providers", authenticate, searchProviders);
router.post("/select-provider", authenticate, selectProvider);

// Route to create a new service request
router.post("/requests", authenticate, createRequest);

// Route to get all requests
router.get("/requests", authenticate, getRequests);
router.get("/categories", authenticate, getCategories);

// Route to get requests for a specific provider
router.get("/requests/get", authenticate, getRequestsForProvider);


// Route to update the status of a service request
router.patch("/requests/:requestId/status", authenticate, updateRequestStatus);
router.patch("/requests/complete/:requestId", authenticate, completeRequest);


router.get("/requests/history", authenticate, getJobHistory);

router.get("/requests/accepted", authenticate, getAcceptedRequestsByProvider);

router.delete("/requests/:requestId", authenticate, deleteRequest);

// Route to fetch job history for providers
router.get("/requests/provider/history", authenticate, getProviderJobHistory);

// Route to get request count for providers
router.get("/provider/count", authenticate, getRequestCount);

router.patch("/requests/:id/pay", authenticate, markAsPaidAndGetContact);

export default router;