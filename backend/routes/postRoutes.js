import express from 'express';
import {
  getPosts,
  createPost,
  likePost,
  unlikePost,
  toggleSavePost,
  deletePost,
  precheckContent,
} from '../controllers/postController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getPosts);
router.post('/precheck', optionalAuth, precheckContent);
router.post('/', protect, createPost);
router.post('/:id/like', protect, likePost);
router.delete('/:id/like', protect, unlikePost);
router.post('/:id/save', protect, toggleSavePost);
router.delete('/:id', protect, deletePost);

export default router;
