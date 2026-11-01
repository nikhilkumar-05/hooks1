import express from 'express';
import {
  getUsers,
  getUserById,
  updateMe,
  getMyConnections,
  toggleConnection,
  toggleFollow,
  getSavedPosts,
} from '../controllers/userController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getUsers);
router.get('/me/connections', protect, getMyConnections);
router.get('/me/saved-posts', protect, getSavedPosts);
router.patch('/me', protect, updateMe);
router.get('/:id', optionalAuth, getUserById);
router.post('/:id/connect', protect, toggleConnection);
router.post('/:id/follow', protect, toggleFollow);

export default router;
