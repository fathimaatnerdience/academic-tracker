import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Add parent-specific routes here
router.get('/', authorize('admin', 'teacher'), async (req, res) => {
  res.status(200).json({ success: true, data: [] });
});

export default router;
