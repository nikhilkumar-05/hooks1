import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { DECISIONS, moderateContent } from '../services/moderationService.js';

export const getComments = async (req, res) => {
  try {
    const rawComments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: 1 })
      .populate('author', 'name course semester profileImage headline')
      .lean();

    // Organize threaded comments: top-level comments and their replies
    const topLevel = [];
    const replyMap = {};

    for (const comment of rawComments) {
      if (comment.parentComment) {
        const parentId = comment.parentComment.toString();
        if (!replyMap[parentId]) {
          replyMap[parentId] = [];
        }
        replyMap[parentId].push(comment);
      } else {
        topLevel.push(comment);
      }
    }

    const threaded = topLevel.map((c) => ({
      ...c,
      replies: replyMap[c._id.toString()] || [],
    }));

    res.json(threaded);
  } catch (error) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ error: 'Failed to retrieve comments' });
  }
};

export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;
    const trimmedContent = String(content || '').trim();

    if (!trimmedContent) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Run AI content moderation
    const moderation = await moderateContent({ text: trimmedContent });
    if (moderation.decision === DECISIONS.REJECTED) {
      return res.status(422).json({
        error: moderation.reason || 'Comment violates LPU Hooks safety guidelines.',
        category: moderation.category,
      });
    }

    if (moderation.decision === DECISIONS.REVIEW_REQUIRED) {
      return res.status(202).json({
        message: moderation.reason || 'Comment is queued for safety review.',
        moderationStatus: moderation.decision,
      });
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content: trimmedContent,
      parentComment: parentCommentId || null,
      likes: [],
    });

    const populated = await Comment.findById(comment._id)
      .populate('author', 'name course semester profileImage headline')
      .lean();

    // Send notification
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment && parentComment.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: parentComment.author,
          sender: req.user._id,
          type: 'comment',
          post: postId,
          message: `${req.user.name} replied to your comment`,
        }).catch((err) => console.error(err));
      }
    } else if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: postId,
        message: `${req.user.name} commented on your campus post`,
      }).catch((err) => console.error(err));
    }

    res.status(201).json({
      ...populated,
      replies: [],
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const alreadyLiked = comment.likes.some((lid) => lid.toString() === userId.toString());
    if (alreadyLiked) {
      comment.likes = comment.likes.filter((lid) => lid.toString() !== userId.toString());
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    const populated = await Comment.findById(id)
      .populate('author', 'name course semester profileImage headline')
      .lean();

    res.json(populated);
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ error: 'Failed to toggle comment like' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(id);
    await Comment.deleteMany({ parentComment: id });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
