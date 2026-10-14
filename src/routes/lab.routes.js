import Lab from '../models/Lab.js';
import { buildCrudRouter } from '../utils/crudRouter.js';

export default buildCrudRouter(Lab, {
  slugFrom: 'title',
  searchFields: ['title', 'description', 'notes', 'category', 'tags'],
  filterFields: ['category', 'difficulty', 'solved', 'topic', 'published'],
  sortDefault: 'order -createdAt',
});