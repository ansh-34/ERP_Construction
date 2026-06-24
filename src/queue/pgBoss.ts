import { PgBoss, type ConstructorOptions } from 'pg-boss';
import type { PoolConfig } from 'pg';
import variables from '../config/variables.config.js';

// Queue name for invoice PDF generation jobs.
export const PDF_QUEUE = 'pdf-generation';

// pg-boss runs entirely on the existing Postgres database (it manages its own
// `pgboss` schema) — no Redis or other external queue infrastructure required.
let boss: PgBoss | null = null;
let starting: Promise<PgBoss> | null = null;

type PgBossPoolOptions = ConstructorOptions &
  Pick<
    PoolConfig,
    'keepAlive' | 'keepAliveInitialDelayMillis' | 'maxLifetimeSeconds'
  >;

function positiveInteger(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function sslOptions(): PoolConfig['ssl'] | undefined {
  const databaseUrl = variables.DATABASE_URL;
  const sslMode = databaseUrl
    ? new URL(databaseUrl).searchParams.get('sslmode')
    : null;
  const enabled =
    variables.PG_BOSS_SSL === 'true' ||
    ['require', 'verify-ca', 'verify-full'].includes(sslMode ?? '');

  if (!enabled) return undefined;

  return {
    rejectUnauthorized: variables.PG_BOSS_SSL_REJECT_UNAUTHORIZED !== 'false',
  };
}

function buildOptions(): PgBossPoolOptions {
  if (!variables.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to start pg-boss');
  }

  return {
    connectionString: variables.DATABASE_URL,
    application_name: 'construction-erp-pg-boss',
    max: positiveInteger(variables.PG_BOSS_MAX_CONNECTIONS, 3),
    connectionTimeoutMillis: positiveInteger(
      variables.PG_BOSS_CONNECTION_TIMEOUT_MS,
      30_000,
    ),
    keepAlive: true,
    keepAliveInitialDelayMillis: positiveInteger(
      variables.PG_BOSS_KEEP_ALIVE_DELAY_MS,
      10_000,
    ),
    maxLifetimeSeconds: positiveInteger(
      variables.PG_BOSS_MAX_LIFETIME_SECONDS,
      300,
    ),
    ssl: sslOptions(),
  };
}

export async function getBoss(): Promise<PgBoss> {
  if (boss) return boss;

  if (!starting) {
    starting = (async () => {
      const instance = new PgBoss(buildOptions());

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
