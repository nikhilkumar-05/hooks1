import Event from '../models/Event.js';

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDate: 1 }).lean();
    res.json(events);
  } catch (error) {
    console.error('Fetch events error:', error);
    res.status(500).json({ error: 'Failed to retrieve events from database' });
  }
};

export const rsvpEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.attendees.some((a) => a.toString() === userId.toString())) {
      event.attendees.push(userId);
      await event.save();
    }

    res.json(event);
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({ error: 'Failed to RSVP to event' });
  }
};

export const cancelRsvp = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    event.attendees = event.attendees.filter(
      (a) => a.toString() !== userId.toString()
    );
    await event.save();

    res.json(event);
  } catch (error) {
    console.error('Cancel RSVP error:', error);
    res.status(500).json({ error: 'Failed to cancel RSVP' });
  }
};
