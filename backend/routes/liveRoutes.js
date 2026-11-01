import express from 'express';
import {
  getLiveSessions,
  createLiveSession,
  joinLiveSession,
  endLiveSession,
} from '../controllers/liveController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getLiveSessions);
router.post('/', protect, createLiveSession);
router.post('/:id/join', optionalAuth, joinLiveSession);
router.post('/:id/end', protect, endLiveSession);

export default router;

