import { User } from '../models/User.js';
import { Enrollment } from '../models/Enrollment.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const overview = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();

  const perCourse = await Enrollment.aggregate([
    {
      $group: {
        _id: '$courseId',
        enrollments: { $sum: 1 },
        completed: { $sum: { $cond: ['$completed', 1, 0] } },
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course',
      },
    },
    { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        completionRate: {
          $cond: [
            { $eq: ['$enrollments', 0] },
            0,
            { $multiply: [{ $divide: ['$completed', '$enrollments'] }, 100] },
          ],
        },
      },
    },
    {
      $project: {
        _id: 0,
        courseId: '$_id',
        title: '$course.title',
        enrollments: 1,
        completed: 1,
        completionRate: { $round: ['$completionRate', 1] },
      },
    },
    { $sort: { enrollments: -1 } },
  ]);

  res.json({
    totalUsers,
    enrollmentsPerCourse: perCourse,
  });
});

