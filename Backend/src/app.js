import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import taskRoutes from './routes/taskRoutes.js';

export const app = express();
app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());
app.get('/health', (request, response) => response.json({ status: 'ok' }));
app.use('/api/tasks', taskRoutes);
app.use((error, request, response, next) => response.status(500).json({ message: 'Internal server error' }));
