import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// POST /api/admin/lessons
export const adminCreateLesson = asyncHandler(async (req, res) => {
  const { moduleId, title, videoUrl, description, duration } = req.body;

  const moduleDoc = await Module.findById(moduleId).lean();
  if (!moduleDoc) throw new ApiError(404, 'Module not found');

  // Auto-increment order
  const lastLesson = await Lesson.findOne({ moduleId }).sort({ order: -1 }).lean();
  const order = lastLesson ? (lastLesson.order || 0) + 1 : 1;

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

// PUT /api/admin/lessons/:id
export const adminUpdateLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, videoUrl, description, duration, order } = req.body;

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (videoUrl !== undefined) updates.videoUrl = videoUrl;
  if (description !== undefined) updates.description = description;
  if (duration !== undefined) updates.duration = duration;
  if (order !== undefined) updates.order = order;

  const lesson = await Lesson.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!lesson) throw new ApiError(404, 'Lesson not found');

  res.json({ lesson });
});

// DELETE /api/admin/lessons/:id
export const adminDeleteLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lesson = await Lesson.findByIdAndDelete(id);
  if (!lesson) throw new ApiError(404, 'Lesson not found');

  res.status(204).send();
});

// PUT /api/admin/lessons/reorder  – body: { lessons: [{id, order}] }
export const adminReorderLessons = asyncHandler(async (req, res) => {
  const { lessons } = req.body;

  if (!Array.isArray(lessons)) throw new ApiError(400, 'lessons must be an array');

  await Promise.all(
    lessons.map(({ id, order }) =>
      Lesson.findByIdAndUpdate(id, { order }, { runValidators: true })
    )
  );

  res.json({ ok: true });
});
