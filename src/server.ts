import app from '@/app';
import { initDatabase } from './infra/database/prisma/prisma.client';
import { variables } from '@config/index';
import { runFunctions } from '@start/index';

const startServer = async () => {
  try {
    app.listen(variables.PORT, async () => {
      // await initDatabase();
      await runFunctions();
      console.log(`[SERVER]: server started at port ${variables.PORT}.`);
    });
  } catch (error) {
    console.error(
      `[SERVER]: Failed to start server at port ${variables.PORT}:`,
      error,
    );
    process.exit(1);
  }
};

startServer();
