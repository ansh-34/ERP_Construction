import { PgBoss } from 'pg-boss';
import variables from '../config/variables.config.js';

// Queue name for invoice PDF generation jobs.
export const PDF_QUEUE = 'pdf-generation';

// pg-boss runs entirely on the existing Postgres database (it manages its own
// `pgboss` schema) — no Redis or other external queue infrastructure required.
let boss: PgBoss | null = null;
let starting: Promise<PgBoss> | null = null;

export async function getBoss(): Promise<PgBoss> {
  if (boss) return boss;

  if (!starting) {
    starting = (async () => {
      const instance = new PgBoss({
        connectionString: variables.DATABASE_URL as string,
      });

      instance.on('error', (err: Error) => {
        console.error('[pg-boss] error:', err);
      });

      await instance.start();
      await instance.createQueue(PDF_QUEUE);

      boss = instance;
      console.log(`[pg-boss] started — queue ready: '${PDF_QUEUE}'`);
      return instance;
    })().catch((err) => {
      // Allow a later retry if start failed.
      starting = null;
      throw err;
    });
  }

  return starting;
}

export async function stopBoss(): Promise<void> {
  if (boss) {
    await boss.stop({ graceful: true }).catch(() => {});
    boss = null;
    starting = null;
  }
}
