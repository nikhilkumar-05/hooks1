import express from 'express';
import {
  getComments,
  createComment,
  likeComment,
  deleteComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:postId', getComments);
router.post('/:postId', protect, createComment);
router.post('/:id/like', protect, likeComment);
router.delete('/:id', protect, deleteComment);

export default router;
