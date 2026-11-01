import mongoose from 'mongoose';

const liveSessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Live title is required'],
      trim: true,
      maxlength: 140,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['Campus Discussion', 'Club AMA', 'Sports & Gaming', 'Tech Talk', 'Study With Me'],
      default: 'Campus Discussion',
    },
    status: {
      type: String,
      enum: ['live', 'ended'],
      default: 'live',
      index: true,
    },
    viewersCount: {
      type: Number,
      default: 1,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    coverGradient: {
      type: String,
      default: 'from-rose-500 to-orange-500',
    },
  },
  {
    timestamps: true,
  }
);

liveSessionSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('LiveSession', liveSessionSchema);

