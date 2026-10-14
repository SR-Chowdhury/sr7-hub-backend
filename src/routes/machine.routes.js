import Machine from '../models/Machine.js';
import { buildCrudRouter } from '../utils/crudRouter.js';

export default buildCrudRouter(Machine, {
  slugFrom: 'machineName',
  searchFields: ['machineName', 'summary', 'tools'],
  filterFields: ['difficulty', 'os', 'userFlag', 'rootFlag', 'retired', 'published'],
  sortDefault: 'order -createdAt',
});