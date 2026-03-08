import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    instructor: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    image: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    difficulty: {
      type: String,
      trim: true,
      maxlength: 40,
    },
    duration: {
      type: String,
      trim: true,
      maxlength: 40,
    },
  },
  { timestamps: true }
);

export const Course = mongoose.model('Course', courseSchema);

