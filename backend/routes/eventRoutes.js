import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventController.js';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getEvents)
  .post(authorize('admin', 'teacher'), createEvent);

router.route('/:id')
  .get(getEvent)
  .put(authorize('admin', 'teacher'), updateEvent)
  .delete(authorize('admin'), deleteEvent);

export default router;