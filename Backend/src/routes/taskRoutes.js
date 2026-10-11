import { Router } from 'express';
import { createTask, deleteTask, getAuditLogs, getTasks, updateStatus } from '../controllers/taskController.js';

const router = Router();
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id/status', updateStatus);
router.delete('/:id', deleteTask);
router.get('/:id/audit-logs', getAuditLogs);
export default router;
