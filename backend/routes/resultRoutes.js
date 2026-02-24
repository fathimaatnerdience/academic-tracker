
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getResults,
  getResult,
  createResult,
  updateResult,
  deleteResult
} from '../controllers/resultController.js';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getResults)
  .post(authorize('admin', 'teacher'), createResult);

router.route('/:id')
  .get(getResult)
  .put(authorize('admin', 'teacher'), updateResult)
  .delete(authorize('admin'), deleteResult);

export default router;
