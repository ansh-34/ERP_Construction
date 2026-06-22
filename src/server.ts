import dotenv from 'dotenv';
import app from './app.js';
import { variables } from './config/index.js';
import prisma from './infra/database/prisma/prisma.client.js';
import { runFunctions } from './start/index.js';
import { startLogUploader } from './utils/logUploader.js';
import { startAlertCron } from './cron/alert.cron.js';
import { startAlertWorker } from './workers/alertWorker/index.js';
import { stopBoss } from './queue/pgBoss.js';
// import { startPdfWorker } from './queue/pdfWorker.js';

dotenv.config();

const port = variables.PORT || 3000;

let shuttingDown = false;

const shutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`${signal} received, shutting down...`);
  await stopBoss();
  await prisma.$disconnect();
  process.exit(0);
};

process.once('SIGINT', () => {
  shutdown('SIGINT').catch(console.error);
});
process.once('SIGTERM', () => {
  shutdown('SIGTERM').catch(console.error);
});

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected');

    await runFunctions();

    // log cron jobs for s3 scheduler and db upload
    startLogUploader();
    startAlertCron();

    startAlertWorker().catch((err) => {
      console.error('Failed to start alert worker:', err);
    });

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

startServer();
