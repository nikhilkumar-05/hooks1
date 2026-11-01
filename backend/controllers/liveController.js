import LiveSession from '../models/LiveSession.js';
import { DECISIONS, moderateContent } from '../services/moderationService.js';

export const getLiveSessions = async (req, res) => {
  try {
    const sessions = await LiveSession.find({ status: 'live' })
      .sort({ createdAt: -1 })
      .populate('host', 'name profileImage course semester headline')
      .lean();
    res.json(sessions);
  } catch (error) {
    console.error('Fetch live sessions error:', error);
    res.status(500).json({ error: 'Failed to retrieve live sessions' });
  }
};

export const createLiveSession = async (req, res) => {
  try {
    const { title, category, tags } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Live session title is required' });
    }

    // AI safety check on live room topic
    const moderation = await moderateContent({ text: title.trim() });
    if (moderation.decision === DECISIONS.REJECTED) {
      return res.status(422).json({
        error: moderation.reason || 'Live session title violates campus safety policies.',
      });
    }

    const gradients = [
      'from-rose-500 to-orange-500',
      'from-purple-600 to-indigo-600',
      'from-blue-600 to-cyan-500',
      'from-emerald-500 to-teal-600',
    ];
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

    const session = await LiveSession.create({
      title: title.trim(),
      host: req.user._id,
      category: category || 'Campus Discussion',
      tags: Array.isArray(tags) ? tags : [],
      coverGradient: randomGradient,
      viewersCount: Math.floor(Math.random() * 5) + 3, // initial campus peers
      status: 'live',
    });

    const populated = await LiveSession.findById(session._id)
      .populate('host', 'name profileImage course semester headline')
      .lean();

    res.status(201).json(populated);
  } catch (error) {
    console.error('Create live session error:', error);
    res.status(500).json({ error: 'Failed to launch live session' });
  }
};

export const joinLiveSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await LiveSession.findByIdAndUpdate(
      id,
      { $inc: { viewersCount: 1 } },
      { new: true }
    ).populate('host', 'name profileImage course semester headline');

    if (!session) {
      return res.status(404).json({ error: 'Live session not found or ended' });
    }

    res.json(session);
  } catch (error) {
    console.error('Join live error:', error);
    res.status(500).json({ error: 'Failed to join session' });
  }
};

export const endLiveSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await LiveSession.findById(id);

    if (!session) {
      return res.status(404).json({ error: 'Live session not found' });
    }

    if (session.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the host can end this live stream' });
    }

    session.status = 'ended';
    await session.save();

    res.json({ message: 'Live stream concluded successfully' });
  } catch (error) {
    console.error('End live error:', error);
    res.status(500).json({ error: 'Failed to end live session' });
  }
};

