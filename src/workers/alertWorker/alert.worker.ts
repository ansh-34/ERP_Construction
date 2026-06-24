import type { Job } from 'pg-boss';
import {
  getAlertBoss,
  AlertJobs,
  type DailyMachineryVarianceJobPayload,
  type MachineryFuelUsageAlertJobPayload,
  type MachineryRuntimeAlertJobPayload,
} from '@/queue/alertQueue';
import { machineryVarianceAlertService } from '@/services/alerts/machineryVarianceAlert.service';

export async function startAlertWorker(): Promise<void> {
  const boss = await getAlertBoss();

  await boss.work<MachineryFuelUsageAlertJobPayload>(
    AlertJobs.CHECK_MACHINERY_FUEL_USAGE,
    { batchSize: 5 },
    async (jobs: Job<MachineryFuelUsageAlertJobPayload>[]) => {
      for (const job of jobs) {
        await machineryVarianceAlertService.checkFuelUsage(job.data);
      }
    },
  );

  await boss.work<MachineryRuntimeAlertJobPayload>(
    AlertJobs.CHECK_MACHINERY_RUNTIME,
    { batchSize: 5 },
    async (jobs: Job<MachineryRuntimeAlertJobPayload>[]) => {
      for (const job of jobs) {
        await machineryVarianceAlertService.checkRuntime(job.data);
      }
    },
  );

  await boss.work<DailyMachineryVarianceJobPayload>(
    AlertJobs.CHECK_DAILY_MACHINERY_VARIANCE,
    { batchSize: 1 },
    async (jobs: Job<DailyMachineryVarianceJobPayload>[]) => {
      for (const job of jobs) {
        await machineryVarianceAlertService.checkCompletedDay(
          job.data.usageDate,
        );
      }
    },
  );

  console.log('[Worker] Alert worker listening for machinery variance checks');
}
