import dotenv from 'dotenv';
import app from './app.js';
import { variables } from './config/index.js';
import prisma from './infra/database/prisma/prisma.client.js';
import { runFunctions } from './start/index.js';

dotenv.config();

const port = variables.PORT || 3000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected');

    await runFunctions();

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};
startServer();
