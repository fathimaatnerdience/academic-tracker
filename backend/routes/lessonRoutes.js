import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson
} from '../controllers/lessonController.js';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getLessons)
  .post(authorize('admin'), createLesson);

router.route('/:id')
  .get(getLesson)
  .put(authorize('admin'), updateLesson)
  .delete(authorize('admin'), deleteLesson);

export default router;