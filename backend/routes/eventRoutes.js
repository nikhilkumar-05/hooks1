import express from 'express';
import {
  getEvents,
  rsvpEvent,
  cancelRsvp,
} from '../controllers/eventController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getEvents);
router.post('/:id/rsvp', protect, rsvpEvent);
router.delete('/:id/rsvp', protect, cancelRsvp);

export default router;
