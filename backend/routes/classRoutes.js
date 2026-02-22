import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass
} from '../controllers/classController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin', 'teacher'), getClasses)
  .post(authorize('admin'), createClass);

router.route('/:id')
  .get(authorize('admin', 'teacher'), getClass)
  .put(authorize('admin'), updateClass)
  .delete(authorize('admin'), deleteClass);

export default router;