import Gig from '../models/Gig.js';
import { buildCrudRouter } from '../utils/crudRouter.js';

export default buildCrudRouter(Gig, {
  slugFrom: 'title',
  searchFields: ['title', 'summary', 'tags'],
  filterFields: ['status', 'published'],
  sortDefault: 'order -createdAt',
});