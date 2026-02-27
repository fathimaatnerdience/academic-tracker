import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getParents,
  getParent,
  createParent,
  updateParent,
  deleteParent
} from '../controllers/parentController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .get(authorize('admin', 'teacher', 'student'), getParents)
  .post(authorize('admin'), createParent);

router.route('/:id')
  .get(getParent)
  .put(authorize('admin'), updateParent)
  .delete(authorize('admin'), deleteParent);

export default router;
