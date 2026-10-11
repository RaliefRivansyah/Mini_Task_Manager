import { DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';

export const AuditLog = sequelize.define(
    'AuditLog',
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        taskId: { type: DataTypes.UUID, allowNull: false, field: 'task_id' },
        actor: { type: DataTypes.STRING(100), allowNull: false },
        fromStatus: { type: DataTypes.STRING(30), allowNull: false, field: 'from_status' },
        toStatus: { type: DataTypes.STRING(30), allowNull: false, field: 'to_status' },
        timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: 'audit_logs', createdAt: false, updatedAt: false },
);
