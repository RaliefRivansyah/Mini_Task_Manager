import { app } from './app.js';
import { env } from './config/env.js';
import { sequelize } from './database/connection.js';
import './database/models/index.js';

await sequelize.authenticate();
app.listen(env.port, () => console.log(`Backend listening on http://localhost:${env.port}`));
