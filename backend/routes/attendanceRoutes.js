import express from 'express';
import { protect } from '../middleware/auth.js';
const router = express.Router();
router.use(protect);
router.get('/', async (req, res) => {
  res.status(200).json({ success: true, data: [] });
});
export default router;