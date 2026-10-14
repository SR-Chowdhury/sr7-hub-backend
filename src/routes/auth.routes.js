import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  message: { error: { message: 'Too many login attempts, try again later.' } },
});

const sign = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, 'Email and password are required');

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid credentials');
    }
    if (!user.active) throw new ApiError(403, 'Account disabled');

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({
      data: {
        token: sign(user),
        user: { id: user._id, email: user.email, name: user.name, role: user.role },
      },
    });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { _id, email, name, role } = req.user;
    res.json({ data: { id: _id, email, name, role } });
  })
);

export default router;