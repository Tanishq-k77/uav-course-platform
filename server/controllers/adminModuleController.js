import { Course } from '../models/Course.js';
import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// POST /api/admin/modules
export const adminCreateModule = asyncHandler(async (req, res) => {
  const { courseId, title } = req.body;

  const course = await Course.findById(courseId).lean();
  if (!course) throw new ApiError(404, 'Course not found');

  // Auto-increment order
  const lastModule = await Module.findOne({ courseId }).sort({ order: -1 }).lean();
  const order = lastModule ? lastModule.order + 1 : 1;

  const moduleDoc = await Module.create({ courseId, title, order });

  res.status(201).json({ module: moduleDoc });
});

// PUT /api/admin/modules/:id
export const adminUpdateModule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, order } = req.body;

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (order !== undefined) updates.order = order;

  const moduleDoc = await Module.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!moduleDoc) throw new ApiError(404, 'Module not found');

  res.json({ module: moduleDoc });
});

// DELETE /api/admin/modules/:id
export const adminDeleteModule = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const moduleDoc = await Module.findById(id);
  if (!moduleDoc) throw new ApiError(404, 'Module not found');

  // Cascade-delete lessons
  await Lesson.deleteMany({ moduleId: id });
  await Module.findByIdAndDelete(id);

  res.status(204).send();
});

// PUT /api/admin/modules/reorder  – body: { modules: [{id, order}] }
export const adminReorderModules = asyncHandler(async (req, res) => {
  const { modules } = req.body;

  if (!Array.isArray(modules)) throw new ApiError(400, 'modules must be an array');

  // Two-pass to avoid transient unique index conflicts on {courseId, order}:
  // Pass 1 – shift every order to a large offset so no collision during flip
  const offset = 100000;
  for (const { id, order } of modules) {
    await Module.findByIdAndUpdate(id, { order: order + offset });
  }
  // Pass 2 – set real orders
  for (const { id, order } of modules) {
    await Module.findByIdAndUpdate(id, { order }, { runValidators: true });
  }

  res.json({ ok: true });
});
