import { Course } from '../models/Course.js';
import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/admin/courses
export const adminListCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 }).lean();

  // Attach module counts for display
  const coursesWithCounts = await Promise.all(
    courses.map(async (course) => {
      const moduleCount = await Module.countDocuments({ courseId: course._id });
      return { ...course, id: course._id, moduleCount };
    })
  );

  res.json({ courses: coursesWithCounts });
});

// POST /api/admin/courses
export const adminCreateCourse = asyncHandler(async (req, res) => {
  const { title, description, category, instructor, image, difficulty, duration } = req.body;

  const course = await Course.create({
    title,
    description,
    category,
    instructor,
    image,
    difficulty,
    duration,
  });

  res.status(201).json({ course });
});

// PUT /api/admin/courses/:id
export const adminUpdateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, category, instructor, image, difficulty, duration } = req.body;

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (category !== undefined) updates.category = category;
  if (instructor !== undefined) updates.instructor = instructor;
  if (image !== undefined) updates.image = image;
  if (difficulty !== undefined) updates.difficulty = difficulty;
  if (duration !== undefined) updates.duration = duration;

  const course = await Course.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!course) throw new ApiError(404, 'Course not found');

  res.json({ course });
});

// DELETE /api/admin/courses/:id
export const adminDeleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id);
  if (!course) throw new ApiError(404, 'Course not found');

  // Cascade-delete modules and lessons
  const modules = await Module.find({ courseId: id }).lean();
  for (const mod of modules) {
    await Lesson.deleteMany({ moduleId: mod._id });
  }
  await Module.deleteMany({ courseId: id });
  await Course.findByIdAndDelete(id);

  res.status(204).send();
});
