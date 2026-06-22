import { getAlertBoss } from './boss';
import { AlertJobs } from './jobs';

export interface MachineryRuntimeAlertJobPayload {
  machineryId: string;
  projectId: string;
  usageDate: string;
  domainId: string;
  adminId: string;
  completedDay?: boolean;
}

export interface MachineryFuelUsageAlertJobPayload extends MachineryRuntimeAlertJobPayload {
  fuelType: 'PETROL' | 'DIESEL';
  fuelUomId: string;
}

export interface DailyMachineryVarianceJobPayload {
  usageDate: string;
}

export async function enqueueMachineryRuntimeAlertCheck(
  payload: MachineryRuntimeAlertJobPayload,
): Promise<void> {
  const boss = await getAlertBoss();
  await boss.send(AlertJobs.CHECK_MACHINERY_RUNTIME, payload, {
    retryLimit: 3,
    retryBackoff: true,
  });
}

export async function enqueueMachineryFuelUsageAlertCheck(
  payload: MachineryFuelUsageAlertJobPayload,
): Promise<void> {
  const boss = await getAlertBoss();
  await boss.send(AlertJobs.CHECK_MACHINERY_FUEL_USAGE, payload, {
    retryLimit: 3,
    retryBackoff: true,
  });
}

export async function enqueueDailyMachineryVarianceCheck(
  payload: DailyMachineryVarianceJobPayload,
): Promise<void> {
  const boss = await getAlertBoss();
  await boss.send(AlertJobs.CHECK_DAILY_MACHINERY_VARIANCE, payload, {
    retryLimit: 3,
    retryBackoff: true,
  });
}
