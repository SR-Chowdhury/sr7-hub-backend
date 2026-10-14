import Audit from '../models/Audit.js';
import { buildCrudRouter } from '../utils/crudRouter.js';

export default buildCrudRouter(Audit, {
  slugFrom: 'title',
  searchFields: ['title', 'summary', 'client', 'environment'],
  filterFields: ['category', 'published'],
  sortDefault: 'order -createdAt',
});