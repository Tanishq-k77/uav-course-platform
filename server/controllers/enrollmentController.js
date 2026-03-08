import { Enrollment } from '../models/Enrollment.js';
import { Course } from '../models/Course.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createEnrollment = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  const course = await Course.findById(courseId).lean();
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  // Prevent duplicate enrollments
  const existing = await Enrollment.findOne({
    user: req.user.id,
    course: courseId,
  }).lean();

  if (existing) {
    return res.status(409).json({ message: 'You are already enrolled in this course.' });
  }

  await Enrollment.create({
    user: req.user.id,
    course: courseId,
  });

  res.status(201).json({
    success: true,
    message: 'Enrollment successful',
  });
});

export const getEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email role')
    .populate('course', 'title')
    .lean();

  const result = enrollments.map((e) => ({
    id: e._id,
    user: e.user,
    course: e.course,
    createdAt: e.createdAt,
  }));

  res.json({ enrollments: result });
});

export const getUserEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .populate('course', 'title description image difficulty duration')
    .lean();

  const result = enrollments.map((e) => ({
    id: e._id,
    course: e.course,
    createdAt: e.createdAt,
  }));

  res.json({ enrollments: result });
});
