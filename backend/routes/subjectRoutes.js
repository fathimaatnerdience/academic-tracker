import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject
} from '../controllers/subjectController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin', 'teacher', 'student', 'parent'), getSubjects)
  .post(authorize('admin'), createSubject);

router.route('/:id')
  .get(authorize('admin', 'teacher', 'student', 'parent'), getSubject)
  .put(authorize('admin'), updateSubject)
  .delete(authorize('admin'), deleteSubject);

export default router;
