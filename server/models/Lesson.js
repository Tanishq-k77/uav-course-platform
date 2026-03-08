import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    videoUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    duration: {
      // duration in seconds
      type: Number,
      required: true,
      min: 1,
    },
    order: {
      type: Number,
      min: 1,
    },
  },
  { timestamps: true }
);

lessonSchema.index({ moduleId: 1, title: 1 });

export const Lesson = mongoose.model('Lesson', lessonSchema);

