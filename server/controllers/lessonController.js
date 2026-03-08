import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createLesson = asyncHandler(async (req, res) => {
  const { moduleId, title, videoUrl, description, duration, order } = req.body;

  const moduleDoc = await Module.findById(moduleId).lean();
  if (!moduleDoc) throw new ApiError(404, 'Module not found');

  const lesson = await Lesson.create({
    moduleId,
    title,
    videoUrl,
    description,
    duration,
    order,
  });

  res.status(201).json({ lesson });
});

export const getLessonsByModule = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;

  const moduleDoc = await Module.findById(moduleId).lean();
  if (!moduleDoc) {
    throw new ApiError(404, 'Module not found');
  }

  const lessons = await Lesson.find({ moduleId })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  res.json({
    module: {
      id: moduleDoc._id,
      title: moduleDoc.title,
      courseId: moduleDoc.courseId,
    },
    lessons: lessons.map((l) => ({
      id: l._id,
      title: l.title,
      videoUrl: l.videoUrl,
      description: l.description,
      duration: l.duration,
      order: l.order,
    })),
  });
});

