import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Club name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Club description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Club category is required'],
      trim: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Club = mongoose.model('Club', clubSchema);
export default Club;
