import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAttendances,
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance
} from '../controllers/attendanceController.js';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getAttendances)
  .post(authorize('admin', 'teacher'), createAttendance);

router.route('/:id')
  .get(getAttendance)
  .put(authorize('admin', 'teacher'), updateAttendance)
  .delete(authorize('admin'), deleteAttendance);

export default router;