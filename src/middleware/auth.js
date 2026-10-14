import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';

const extract = (req) => {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
};

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = extract(req);
  if (!token) throw new ApiError(401, 'Authentication required');

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.active) throw new ApiError(401, 'Session no longer valid');

  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extract(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (user?.active) req.user = user;
  } catch {
    /* ignore */
  }
  next();
});

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== 'admin') return next(new ApiError(403, 'Admin access required'));
  next();
};