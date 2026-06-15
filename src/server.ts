import dotenv from 'dotenv';
import app from './app.js';
import { variables } from './config/index.js';
import prisma from './infra/database/prisma/prisma.client.js';
import { runFunctions } from './start/index.js';
import { startLogUploader } from './utils/logUploader.js';
// import { startPdfWorker } from './queue/pdfWorker.js';
import { stopBoss } from './queue/pgBoss.js';

dotenv.config();

const port = variables.PORT || 3000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected');

    await runFunctions();

    // log cron jobs for s3 scheduler and db upload
    startLogUploader();

  
    // startPdfWorker().catch((err) => {
    //   console.error('Failed to start PDF worker:', err);
    // });

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

const shutdown = async (signal: string) => {
  console.log(`\n${signal} received — shutting down pg-boss...`);
  await stopBoss();
  process.exit(0);
};
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

startServer();
