import Club from '../models/Club.js';

export const getClubs = async (req, res) => {
  try {
    const clubs = await Club.find().sort({ name: 1 }).lean();
    res.json(clubs);
  } catch (error) {
    console.error('Fetch clubs error:', error);
    res.status(500).json({ error: 'Failed to retrieve clubs from database' });
  }
};

export const joinClub = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const club = await Club.findById(id);
    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    if (!club.members.some((m) => m.toString() === userId.toString())) {
      club.members.push(userId);
      await club.save();
    }

    res.json(club);
  } catch (error) {
    console.error('Join club error:', error);
    res.status(500).json({ error: 'Failed to join club' });
  }
};

export const leaveClub = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const club = await Club.findById(id);
    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    club.members = club.members.filter(
      (m) => m.toString() !== userId.toString()
    );
    await club.save();

    res.json(club);
  } catch (error) {
    console.error('Leave club error:', error);
    res.status(500).json({ error: 'Failed to leave club' });
  }
};
