import { Course } from '../models/Course.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listCourses = asyncHandler(async (req, res) => {
  const { category, q } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (q) {
    filter.$or = [
      { title: { $regex: String(q), $options: 'i' } },
      { description: { $regex: String(q), $options: 'i' } },
      { instructor: { $regex: String(q), $options: 'i' } },
    ];
  }

  const courses = await Course.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ courses });
});

export const getCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id).lean();
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  res.json({ course });
});

export const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, instructor } = req.body;

  const course = await Course.create({
    title,
    description,
    category,
    instructor,
  });

  res.status(201).json({ course });
});

export const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, category, instructor } = req.body;

  const course = await Course.findByIdAndUpdate(
    id,
    { title, description, category, instructor },
    { new: true, runValidators: true }
  );

  if (!course) throw new ApiError(404, 'Course not found');

  res.json({ course });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findByIdAndDelete(id);
  if (!course) throw new ApiError(404, 'Course not found');

  res.status(204).send();
});

