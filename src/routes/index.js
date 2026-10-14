import express from 'express';
import authRoutes from './auth.routes.js';
import labRoutes from './lab.routes.js';
import machineRoutes from './machine.routes.js';
import walkthroughRoutes from './walkthrough.routes.js';
import auditRoutes from './audit.routes.js';
import gigRoutes from './gig.routes.js';
import profileRoutes from './profile.routes.js';

const router = express.Router();

router.get('/health', (_req, res) =>
  res.json({ status: 'ok', uptime: process.uptime(), ts: new Date().toISOString() })
);

router.use('/auth', authRoutes);
router.use('/labs', labRoutes);
router.use('/machines', machineRoutes);
router.use('/walkthroughs', walkthroughRoutes);
router.use('/audits', auditRoutes);
router.use('/gigs', gigRoutes);
router.use('/profile', profileRoutes);

export default router;