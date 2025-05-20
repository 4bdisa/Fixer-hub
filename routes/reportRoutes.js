import express from 'express';
const router = express.Router();
import { createReport } from '../controllers/reportController.js';
//import { protect } from '../middleware/authMiddleware.js'; // Example auth middleware

router.post('/', createReport); // You might want to add auth middleware here (e.g., protect)

export default router;