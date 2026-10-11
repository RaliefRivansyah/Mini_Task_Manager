import { Task } from './task.js';
import { AuditLog } from './auditLog.js';

Task.hasMany(AuditLog, { foreignKey: 'taskId', as: 'auditLogs' });
AuditLog.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

export { Task, AuditLog };
