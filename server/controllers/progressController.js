import mongoose from 'mongoose';
import { Progress } from '../models/Progress.js';
import { Lesson } from '../models/Lesson.js';
import { Module } from '../models/Module.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const markLessonComplete = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { lessonId } = req.body;

  if (!mongoose.isValidObjectId(lessonId)) {
    throw new ApiError(400, 'Invalid lessonId');
  }

  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found');
  }

  const progress = await Progress.findOneAndUpdate(
    { user: userId, lesson: lessonId },
    { completed: true },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({
    progress: {
      id: progress._id,
      user: progress.user,
      lesson: progress.lesson,
      completed: progress.completed,
    },
  });
});

export const getCourseProgress = asyncHandler(async (req, res) => {
  const { courseId, userId } = req.params;

  if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid courseId or userId');
  }

  // Optionally enforce that logged in user matches userId or is admin
  if (
    !req.user ||
    (req.user.role !== 'Admin' && req.user._id.toString() !== userId.toString())
  ) {
    throw new ApiError(403, 'Forbidden');
  }

  const modules = await Module.find({ courseId }).select('_id').lean();
  const moduleIds = modules.map((m) => m._id);

  const totalLessons = await Lesson.countDocuments({
    moduleId: { $in: moduleIds },
  });

  if (totalLessons === 0) {
    return res.json({
      totalLessons: 0,
      completedLessons: 0,
      percent: 0,
      completedLessonIds: [],
    });
  }

  const completed = await Progress.find({
    user: userId,
    completed: true,
  })
    .select('lesson')
    .lean();

  const completedLessonIds = completed.map((p) => p.lesson.toString());
  const completedLessons = completedLessonIds.length;
  const percent = Math.round((completedLessons / totalLessons) * 100);

  res.json({
    totalLessons,
    completedLessons,
    percent,
    completedLessonIds,
  });
});

