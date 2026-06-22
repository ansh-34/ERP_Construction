import cron from 'node-cron';
import { enqueueDailyMachineryVarianceCheck } from '@/queue/alertQueue';

function previousUtcDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function startAlertCron(): void {
  cron.schedule(
    '5 0 * * *',
    () => {
      enqueueDailyMachineryVarianceCheck({
        usageDate: previousUtcDate(),
      }).catch((error: unknown) => {
        console.error(
          'Failed to enqueue daily machinery variance check:',
          error instanceof Error ? error.message : error,
        );
      });
    },
    { timezone: 'UTC' },
  );
}
