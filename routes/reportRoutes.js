import express from 'express';
const router = express.Router();
import { createReport, getReports, checkIfReported } from '../controllers/reportController.js';
import { verifyAdmin, authorizeRoles } from '../middleWares/authMiddleware.js';

router.post('/', createReport);
router.get('/get', verifyAdmin, authorizeRoles('admin'), getReports);
router.post('/check', checkIfReported); // <-- Add this line

export default router;