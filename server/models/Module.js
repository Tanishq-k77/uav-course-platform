import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

moduleSchema.index({ courseId: 1, order: 1 }, { unique: true });

export const Module = mongoose.model('Module', moduleSchema);

