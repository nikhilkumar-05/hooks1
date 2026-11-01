import Post from '../models/Post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import { DECISIONS, moderateContent } from '../services/moderationService.js';

export const precheckContent = async (req, res) => {
  try {
    const { content, imageUrl } = req.body;
    const result = await moderateContent({
      text: content || '',
      imageUrl: imageUrl || null,
    });
    res.json(result);
  } catch (error) {
    console.error('Precheck moderation error:', error);
    res.status(500).json({ error: 'AI Safety check failed' });
  }
};

export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const filterType = req.query.filter; // 'saved', 'following', or null

    let filter = {
      $or: [
        { moderationStatus: DECISIONS.APPROVED },
        { moderationStatus: { $exists: false } },
      ],
    };

    if (filterType === 'saved' && req.user) {
      const user = await User.findById(req.user._id).select('savedPosts');
      filter = {
        _id: { $in: user?.savedPosts || [] },
        ...filter,
      };
    } else if (filterType === 'following' && req.user) {
      const user = await User.findById(req.user._id).select('following');
      filter = {
        author: { $in: user?.following || [] },
        ...filter,
      };
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email course semester profileImage headline')
        .lean(),
      Post.countDocuments(filter),
    ]);

    // Attach comment counts to posts
    const postIds = posts.map((p) => p._id);
    const commentCounts = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } },
    ]);
    const commentCountMap = {};
    for (const item of commentCounts) {
      commentCountMap[item._id.toString()] = item.count;
    }

    const enhancedPosts = posts.map((p) => ({
      ...p,
      commentCount: commentCountMap[p._id.toString()] || 0,
      isLiked: req.user ? p.likes?.some((id) => id.toString() === req.user._id.toString()) : false,
      isSaved: req.user?.savedPosts ? req.user.savedPosts.some((id) => id.toString() === p._id.toString()) : false,
    }));

    res.json({
      posts: enhancedPosts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Fetch posts error:', error);
    res.status(500).json({ error: 'Failed to retrieve posts from database' });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, imageUrl } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Post content cannot be empty' });
    }

    // Run AI content moderation on text and image
    const moderation = await moderateContent({
      text: content.trim(),
      imageUrl: imageUrl?.trim() || null,
    });

    if (moderation.decision === DECISIONS.REJECTED) {
      return res.status(422).json({
        error: moderation.reason || 'This post violates LPU Hooks campus safety guidelines.',
        category: moderation.category,
        label: moderation.label,
        moderationStatus: moderation.decision,
      });
    }

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      imageUrl: imageUrl ? imageUrl.trim() : '',
      likes: [],
      moderationStatus: moderation.decision,
      moderationCategory: moderation.category,
      moderationReason: moderation.reason,
      moderationConfidence: moderation.confidence,
    });

    if (moderation.decision === DECISIONS.REVIEW_REQUIRED) {
      return res.status(202).json({
        message: moderation.reason || 'Your post is under campus moderation review and will appear once approved.',
        moderationStatus: moderation.decision,
        postId: post._id,
      });
    }

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email course semester profileImage headline')
      .lean();

    res.status(201).json({
      ...populatedPost,
      commentCount: 0,
      isLiked: false,
      isSaved: false,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: error.message || 'Failed to create post' });
  }
};

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const alreadyLiked = post.likes.some((likeId) => likeId.toString() === userId.toString());
    if (!alreadyLiked) {
      post.likes.push(userId);
      await post.save();

      // Create notification for author if not liking own post
      if (post.author.toString() !== userId.toString()) {
        await Notification.create({
          recipient: post.author,
          sender: userId,
          type: 'like',
          post: post._id,
          message: `${req.user.name} liked your campus post`,
        }).catch((err) => console.error('Notification error:', err));
      }
    }

    const updatedPost = await Post.findById(id)
      .populate('author', 'name email course semester profileImage headline')
      .lean();

    const commentCount = await Comment.countDocuments({ post: id });

    res.json({
      ...updatedPost,
      commentCount,
      isLiked: true,
      isSaved: req.user.savedPosts?.some((savedId) => savedId.toString() === id.toString()) || false,
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.likes = post.likes.filter((likeId) => likeId.toString() !== userId.toString());
    await post.save();

    const updatedPost = await Post.findById(id)
      .populate('author', 'name email course semester profileImage headline')
      .lean();

    const commentCount = await Comment.countDocuments({ post: id });

    res.json({
      ...updatedPost,
      commentCount,
      isLiked: false,
      isSaved: req.user.savedPosts?.some((savedId) => savedId.toString() === id.toString()) || false,
    });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
};

export const toggleSavePost = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isSaved = user.savedPosts?.some((postId) => postId.toString() === id.toString());
    if (isSaved) {
      user.savedPosts = user.savedPosts.filter((postId) => postId.toString() !== id.toString());
      await user.save();
      return res.json({ saved: false, message: 'Post removed from saved items' });
    } else {
      user.savedPosts.push(id);
      await user.save();
      return res.json({ saved: true, message: 'Post saved successfully' });
    }
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({ error: 'Failed to toggle saved post' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(id);
    await Comment.deleteMany({ post: id });
    await Notification.deleteMany({ post: id });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};
