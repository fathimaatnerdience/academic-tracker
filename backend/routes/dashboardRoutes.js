import express from 'express';
import { protect } from '../middleware/auth.js';
import { getAttendanceChart } from '../controllers/dashboardController.js';

const router = express.Router();
router.use(protect);

// attendance chart data (male/female counts per date)
router.get('/attendance-chart', getAttendanceChart);

export default router;