import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post author is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Post content cannot be empty'],
      trim: true,
      maxlength: [3000, 'Post content cannot exceed 3000 characters'],
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    moderationStatus: {
      type: String,
      enum: ['APPROVED', 'REJECTED', 'REVIEW_REQUIRED'],
      default: 'APPROVED',
      index: true,
    },
    moderationCategory: {
      type: String,
      default: null,
    },
    moderationReason: {
      type: String,
      default: null,
    },
    moderationConfidence: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);
export default Post;
