import { Transaction } from 'sequelize';
import { sequelize } from '../database/connection.js';
import { Task, AuditLog } from '../database/models/index.js';

export const STATUSES = ['to_do', 'pending', 'in_progress', 'done'];
export const ACTORS = ['John Doe', 'Jane Smith', 'Alice'];

export async function listTasks() {
    return Task.findAll({ order: [['createdAt', 'DESC']] });
}

export async function createTask({ title, description = '' }) {
    if (!title || !title.trim()) throw new Error('Title is required');
    return Task.create({ title: title.trim(), description });
}

export async function deleteTask(id) {
    const deleted = await Task.destroy({ where: { id } });
    if (!deleted) throw new Error('Task not found');
}

export async function updateStatus(id, status, actor) {
    if (!STATUSES.includes(status)) throw new Error('Invalid status');
    if (!ACTORS.includes(actor)) throw new Error('Invalid actor');
    return sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED }, async (transaction) => {
        const task = await Task.findByPk(id, { lock: transaction.LOCK.UPDATE, transaction });
        if (!task) throw new Error('Task not found');
        if (task.status === status) return task;
        if (STATUSES.indexOf(status) !== STATUSES.indexOf(task.status) + 1) {
            throw new Error(`Invalid transition from ${task.status} to ${status}`);
        }
        const fromStatus = task.status;
        await task.update({ status }, { transaction });
        await AuditLog.create({ taskId: task.id, actor, fromStatus, toStatus: status }, { transaction });
        return task;
    });
}

export async function getAuditLogs(taskId) {
    const taskExists = await Task.count({ where: { id: taskId } });
    if (!taskExists) throw new Error('Task not found');
    return AuditLog.findAll({ where: { taskId }, order: [['timestamp', 'ASC']] });
}
