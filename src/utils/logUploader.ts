import cron from 'node-cron';
import variables from '@/config/variables.config';
import {
  initLogPipeline,
  runNightlyLogPipeline,
} from '@/services/logPipeline.service';

const CRON_SCHEDULE = '0 0 * * *';

export function startLogUploader(): void {
  if (variables.LOGS_ENABLE !== 'true') {
    console.log('[LogUploader] Logging disabled — skipping scheduler');
    return;
  }

  initLogPipeline();

  cron.schedule(CRON_SCHEDULE, () => {
    runNightlyLogPipeline().catch((error) => {
      console.error('[LogUploader] Unhandled nightly job error:', error);
    });
  });

  const s3Status = variables.S3_BUCKET
    ? 'DB + S3 enabled'
    : 'DB only (S3 bucket not configured)';

  console.log(
    `[LogUploader] Scheduler started — nightly ${s3Status} at midnight (${CRON_SCHEDULE})`,
  );
}

export { runNightlyLogPipeline, runNightlyLogPipeline as runNightlyLogJob };
