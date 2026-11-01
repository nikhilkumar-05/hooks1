import express from 'express';
import { getClubs, joinClub, leaveClub } from '../controllers/clubController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getClubs);
router.post('/:id/join', protect, joinClub);
router.delete('/:id/join', protect, leaveClub);

export default router;
