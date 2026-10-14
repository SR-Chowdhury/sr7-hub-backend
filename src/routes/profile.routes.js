import express from 'express';
import Profile from '../models/Profile.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const findOrCreate = async () => {
  let p = await Profile.findOne({ key: 'fiverr' });
  if (!p) p = await Profile.create({ key: 'fiverr' });
  return p;
};

// Public read
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const p = await findOrCreate();
    res.json({ data: p });
  })
);

// Admin update
router.put(
  '/',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const p = await findOrCreate();
    const { _id, __v, key, createdAt, updatedAt, ...patch } = req.body;
    Object.assign(p, patch);
    await p.save();
    res.json({ data: p });
  })
);

export default router;