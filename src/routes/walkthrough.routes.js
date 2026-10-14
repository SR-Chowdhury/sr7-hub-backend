import Walkthrough from '../models/Walkthrough.js';
import { buildCrudRouter } from '../utils/crudRouter.js';

export default buildCrudRouter(Walkthrough, {
  slugFrom: 'machineName',
  searchFields: ['machineName', 'summary', 'goal', 'notes', 'tools', 'keyFindings'],
  filterFields: ['difficulty', 'os', 'published'],
  sortDefault: 'order -createdAt',
});