import { Course } from '../models/Course.js';
import { Module } from '../models/Module.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createModule = asyncHandler(async (req, res) => {
  const { courseId, title, order } = req.body;

  const course = await Course.findById(courseId).lean();
  if (!course) throw new ApiError(404, 'Course not found');

  const moduleDoc = await Module.create({
    courseId,
    title,
    order,
  });

  res.status(201).json({ module: moduleDoc });
});

export const getModulesByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId).lean();
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  const modules = await Module.find({ courseId })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  res.json({
    course: {
      id: course._id,
      title: course.title,
      description: course.description,
    },
    modules: modules.map((m) => ({
      id: m._id,
      title: m.title,
      order: m.order,
    })),
  });
});

