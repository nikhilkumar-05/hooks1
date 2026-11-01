import User from '../models/User.js';
import Post from '../models/Post.js';
import Connection from '../models/Connection.js';
import Notification from '../models/Notification.js';
import Comment from '../models/Comment.js';

export const getUsers = async (req, res) => {
  try {
    const { q } = req.query;
    let query = {};

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query = {
        $or: [
          { name: searchRegex },
          { course: searchRegex },
          { skills: searchRegex },
          { email: searchRegex },
          { headline: searchRegex },
        ],
      };
    }

    const currentUserId = req.user?._id;
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // If authenticated, get connection and follow statuses
    let userConnections = [];
    let currentUserDoc = null;
    if (currentUserId) {
      userConnections = await Connection.find({
        $or: [{ requester: currentUserId }, { recipient: currentUserId }],
      }).lean();
      currentUserDoc = await User.findById(currentUserId).select('following').lean();
    }

    const connectedUserIds = new Set();
    for (const c of userConnections) {
      if (c.requester.toString() === currentUserId.toString()) {
        connectedUserIds.add(c.recipient.toString());
      } else {
        connectedUserIds.add(c.requester.toString());
      }
    }

    const followingSet = new Set((currentUserDoc?.following || []).map((id) => id.toString()));

    const enrichedUsers = users.map((u) => ({
      ...u,
      isConnected: connectedUserIds.has(u._id.toString()),
      isFollowing: followingSet.has(u._id.toString()),
      isSelf: currentUserId ? u._id.toString() === currentUserId.toString() : false,
    }));

    res.json(enrichedUsers);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to retrieve students' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-passwordHash').lean();

    if (!user) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const userPosts = await Post.find({
      author: id,
      $or: [{ moderationStatus: 'APPROVED' }, { moderationStatus: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .populate('author', 'name email course semester profileImage headline')
      .lean();

    // Check connection & follow status
    let isConnected = false;
    let isFollowing = false;
    if (req.user) {
      const conn = await Connection.findOne({
        $or: [
          { requester: req.user._id, recipient: id },
          { requester: id, recipient: req.user._id },
        ],
      });
      isConnected = !!conn;

      const me = await User.findById(req.user._id).select('following');
      isFollowing = me?.following?.some((fid) => fid.toString() === id.toString()) || false;
    }

    res.json({
      user: {
        ...user,
        isConnected,
        isFollowing,
        isSelf: req.user ? req.user._id.toString() === id.toString() : false,
      },
      posts: userPosts,
    });
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { name, headline, course, semester, bio, skills, profileImage, coverImage } = req.body;
    const userId = req.user._id;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (headline !== undefined) updates.headline = headline.trim();
    if (course !== undefined) updates.course = course.trim();
    if (semester !== undefined) updates.semester = semester.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (profileImage !== undefined) updates.profileImage = profileImage.trim();
    if (coverImage !== undefined) updates.coverImage = coverImage.trim();
    if (skills !== undefined) {
      updates.skills = Array.isArray(skills)
        ? skills.map((s) => s.trim()).filter(Boolean)
        : String(skills)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
};

export const getMyConnections = async (req, res) => {
  try {
    const userId = req.user._id;
    const connections = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }],
    })
      .populate('requester', 'name email course semester profileImage headline')
      .populate('recipient', 'name email course semester profileImage headline')
      .lean();

    const connectionList = connections.map((c) => {
      const isRequester = c.requester._id.toString() === userId.toString();
      const student = isRequester ? c.recipient : c.requester;
      return {
        ...student,
        connectionId: c._id,
        connectedAt: c.createdAt,
      };
    });

    res.json(connectionList);
  } catch (error) {
    console.error('Fetch connections error:', error);
    res.status(500).json({ error: 'Failed to retrieve connections' });
  }
};

export const toggleConnection = async (req, res) => {
  try {
    const requesterId = req.user._id;
    const recipientId = req.params.id;

    if (requesterId.toString() === recipientId.toString()) {
      return res.status(400).json({ error: 'You cannot connect with yourself' });
    }

    const existing = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existing) {
      await Connection.findByIdAndDelete(existing._id);
      return res.json({ connected: false, message: 'Removed connection' });
    } else {
      const conn = await Connection.create({
        requester: requesterId,
        recipient: recipientId,
        status: 'connected',
      });

      // Send notification to recipient
      await Notification.create({
        recipient: recipientId,
        sender: requesterId,
        type: 'connection_request',
        message: `${req.user.name} connected with you on Hooks`,
      }).catch((err) => console.error(err));

      return res.json({ connected: true, message: 'Connected successfully', connection: conn });
    }
  } catch (error) {
    console.error('Toggle connection error:', error);
    res.status(500).json({ error: 'Failed to update connection' });
  }
};

export const toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isFollowing = currentUser.following?.some((id) => id.toString() === targetUserId.toString());

    if (isFollowing) {
      currentUser.following = currentUser.following.filter((id) => id.toString() !== targetUserId.toString());
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== currentUserId.toString());
      await currentUser.save();
      await targetUser.save();
      return res.json({ following: false, message: `Unfollowed ${targetUser.name}` });
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
      await currentUser.save();
      await targetUser.save();

      // Create notification
      await Notification.create({
        recipient: targetUserId,
        sender: currentUserId,
        type: 'follow',
        message: `${req.user.name} started following your campus updates`,
      }).catch((err) => console.error(err));

      return res.json({ following: true, message: `Following ${targetUser.name}` });
    }
  } catch (error) {
    console.error('Toggle follow error:', error);
    res.status(500).json({ error: 'Failed to toggle follow status' });
  }
};

export const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedPosts',
      populate: {
        path: 'author',
        select: 'name email course semester profileImage headline',
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.savedPosts || []);
  } catch (error) {
    console.error('Fetch saved posts error:', error);
    res.status(500).json({ error: 'Failed to retrieve saved posts' });
  }
};
