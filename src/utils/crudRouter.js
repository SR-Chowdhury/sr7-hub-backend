import express from 'express';
import { buildCrud } from '../controllers/crudFactory.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';

export function buildCrudRouter(Model, opts = {}) {
  const router = express.Router();
  const c = buildCrud(Model, opts);

  router.get('/', optionalAuth, c.list);
  router.get('/:id', optionalAuth, c.getOne);

  router.post('/', requireAuth, requireAdmin, c.create);
  router.post('/bulk', requireAuth, requireAdmin, c.bulkUpsert);
  router.patch('/:id', requireAuth, requireAdmin, c.update);
  router.delete('/:id', requireAuth, requireAdmin, c.remove);

  return router;
}