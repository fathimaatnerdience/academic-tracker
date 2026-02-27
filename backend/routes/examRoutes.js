import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam
} from '../controllers/examController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getExams)
  .post(authorize('admin', 'teacher'), createExam);

router.route('/:id')
  .get(getExam)
  .put(authorize('admin', 'teacher'), updateExam)
  .delete(authorize('admin'), deleteExam);

export default router;
