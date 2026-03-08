import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() }).lean();
  if (existing) {
    throw new ApiError(409, 'Email is already registered');
  }

  // Always create new users as students, regardless of any role provided in the request.
  const user = await User.create({
    name,
    email,
    password,
    role: 'Student',
  });

  const token = signToken(user);

  res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+password'
  );
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const ok = await user.comparePassword(password);
  if (!ok) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken(user);

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

