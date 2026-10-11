import { DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';

export const Task = sequelize.define(
    'Task',
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        title: { type: DataTypes.STRING(200), allowNull: false, validate: { notEmpty: true } },
        description: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
        status: {
            type: DataTypes.ENUM('to_do', 'pending', 'in_progress', 'done'),
            allowNull: false,
            defaultValue: 'to_do',
        },
    },
    { tableName: 'tasks' },
);
