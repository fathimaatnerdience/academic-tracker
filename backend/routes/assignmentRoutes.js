import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment
} from '../controllers/assignmentController.js';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getAssignments)
  .post(authorize('admin', 'teacher'), createAssignment);

router.route('/:id')
  .get(getAssignment)
  .put(authorize('admin', 'teacher'), updateAssignment)
  .delete(authorize('admin'), deleteAssignment);

export default router;