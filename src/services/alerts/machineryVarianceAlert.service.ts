import type { Prisma } from '@infra/database/prisma/generated/prisma/client';
import {
  alertRepository,
  alertRuleRepository,
  fuelLogRepository,
  machineryRepository,
  movementLogRepository,
  notificationRepository,
  uomRepository,
  type MachineryFuelUsageContext,
  type MachineryRuntimeContext,
} from '@repositories/index';
import type {
  MachineryFuelUsageAlertJobPayload,
  MachineryRuntimeAlertJobPayload,
} from '@/queue/alertQueue';
import { alertRecipientService } from './alertRecipient.service';

export const MACHINERY_ALERT_MODULE_CODE = 'MACHINERY';
export const MACHINE_RUNTIME_VARIANCE_ALERT_CODE = 'MACHINE_RUNTIME_VARIANCE';
export const MACHINE_FUEL_USAGE_VARIANCE_ALERT_CODE =
  'MACHINE_FUEL_USAGE_VARIANCE';

const MACHINERY_ENTITY_TYPE = 'MACHINERY';
const DEFAULT_HISTORY_DAYS = 30;
const DEFAULT_MINIMUM_HISTORY_DAYS = 7;
const DEFAULT_ALLOWED_DIFFERENCE_PERCENT = 20;

interface VarianceConfig {
  historyDays: number;
  minimumHistoryDays: number;
  allowedDifferencePercent: number;
}

interface VarianceResult {
  average: number;
  current: number;
  differencePercent: number;
  direction: 'HIGH' | 'LOW';
}

function parseUsageDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('invalid usageDate');
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error('invalid usageDate');
  return date;
}

function addUtcDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function positiveNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function readConfig(config: Prisma.JsonValue | null): VarianceConfig {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return {
      historyDays: DEFAULT_HISTORY_DAYS,
      minimumHistoryDays: DEFAULT_MINIMUM_HISTORY_DAYS,
      allowedDifferencePercent: DEFAULT_ALLOWED_DIFFERENCE_PERCENT,
    };
  }

  return {
    historyDays: positiveNumber(config.historyDays, DEFAULT_HISTORY_DAYS),
    minimumHistoryDays: positiveNumber(
      config.minimumHistoryDays,
      DEFAULT_MINIMUM_HISTORY_DAYS,
    ),
    allowedDifferencePercent: positiveNumber(
      config.allowedDifferencePercent,
      DEFAULT_ALLOWED_DIFFERENCE_PERCENT,
    ),
  };
}

function calculateVariance(
  historicalValues: number[],
  current: number,
  config: VarianceConfig,
  completedDay: boolean,
): VarianceResult | null {
  if (historicalValues.length < config.minimumHistoryDays) return null;

  const average =
    historicalValues.reduce((sum, value) => sum + value, 0) /
    historicalValues.length;
  if (average <= 0) return null;

  const upperLimit = average * (1 + config.allowedDifferencePercent / 100);
  const lowerLimit = average * (1 - config.allowedDifferencePercent / 100);

  let direction: VarianceResult['direction'] | null = null;
  if (current > upperLimit) direction = 'HIGH';
  if (completedDay && current < lowerLimit) direction = 'LOW';
  if (!direction) return null;

  return {
    average,
    current,
    differencePercent: Math.abs(((current - average) / average) * 100),
    direction,
  };
}

async function getRule(
  domainId: string,
  adminId: string,
  alertCode: string,
  name: string,
  description: string,
) {
  const existing = await alertRuleRepository.findByCode(
    domainId,
    adminId,
    MACHINERY_ALERT_MODULE_CODE,
    alertCode,
  );
  if (existing) return existing;

  return alertRuleRepository.upsert({
    moduleCode: MACHINERY_ALERT_MODULE_CODE,
    alertCode,
    name,
    description,
    config: {
      historyDays: DEFAULT_HISTORY_DAYS,
      minimumHistoryDays: DEFAULT_MINIMUM_HISTORY_DAYS,
      allowedDifferencePercent: DEFAULT_ALLOWED_DIFFERENCE_PERCENT,
    },
    severity: 'WARNING',
    isEnabled: true,
    domainId,
    adminId,
  });
}

async function createAlert(input: {
  machineryId: string;
  domainId: string;
  adminId: string;
  usageDate: string;
  alertCode: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  metadata: Prisma.InputJsonValue;
}): Promise<void> {
  const existing = await alertRepository.findActiveByEntityForDate(
    input.domainId,
    input.adminId,
    MACHINERY_ALERT_MODULE_CODE,
    input.alertCode,
    MACHINERY_ENTITY_TYPE,
    input.machineryId,
    input.usageDate,
  );
  if (existing) return;

  const alert = await alertRepository.create({
    moduleCode: MACHINERY_ALERT_MODULE_CODE,
    alertCode: input.alertCode,
    entityType: MACHINERY_ENTITY_TYPE,
    entityId: input.machineryId,
    title: input.title,
    message: input.message,
    severity: input.severity,
    metadata: input.metadata,
    domainId: input.domainId,
    adminId: input.adminId,
  });

  const recipients = await alertRecipientService.getRecipients({
    domainId: input.domainId,
    adminId: input.adminId,
    moduleCode: MACHINERY_ALERT_MODULE_CODE,
  });
  const uniqueRecipients = new Map(
    recipients.map((recipient) => [
      `${recipient.recipientType}:${recipient.recipientId}`,
      recipient,
    ]),
  );

  await notificationRepository.createMany(
    [...uniqueRecipients.values()].map((recipient) => ({
      alertId: alert.id,
      recipientType: recipient.recipientType,
      recipientId: recipient.recipientId,
      title: input.title,
      message: input.message,
      domainId: input.domainId,
      adminId: input.adminId,
    })),
  );
}

async function resolveNormalAlert(input: {
  machineryId: string;
  domainId: string;
  adminId: string;
  usageDate: string;
  alertCode: string;
}): Promise<void> {
  await alertRepository.resolveActiveByEntityForDate(
    input.domainId,
    input.adminId,
    MACHINERY_ALERT_MODULE_CODE,
    input.alertCode,
    MACHINERY_ENTITY_TYPE,
    input.machineryId,
    input.usageDate,
  );
}

export const machineryVarianceAlertService = {
  async checkFuelUsage(
    input: MachineryFuelUsageAlertJobPayload,
  ): Promise<void> {
    const rule = await getRule(
      input.domainId,
      input.adminId,
      MACHINE_FUEL_USAGE_VARIANCE_ALERT_CODE,
      'Machine Fuel Usage Variance',
      'Triggers when machinery daily fuel usage differs from its historical daily average.',
    );
    if (!rule.isEnabled || rule.status !== 'ACTIVE') return;

    const config = readConfig(rule.config);
    const targetStart = parseUsageDate(input.usageDate);
    const targetEnd = addUtcDays(targetStart, 1);
    const historyStart = addUtcDays(targetStart, -config.historyDays);
    const context: MachineryFuelUsageContext = {
      machineryId: input.machineryId,
      projectId: input.projectId,
      fuelType: input.fuelType,
      fuelUomId: input.fuelUomId,
      domainId: input.domainId,
      adminId: input.adminId,
    };
    const rows = await fuelLogRepository.findMachineryDailyUsage(
      context,
      historyStart,
      targetEnd,
    );
    const historicalValues = rows
      .filter((row) => row.usageDate !== input.usageDate)
      .map((row) => Number(row.totalQuantity));
    const current = Number(
      rows.find((row) => row.usageDate === input.usageDate)?.totalQuantity ?? 0,
    );
    const result = calculateVariance(
      historicalValues,
      current,
      config,
      input.completedDay === true,
    );

    if (!result) {
      if (input.completedDay) {
        await resolveNormalAlert({
          ...input,
          alertCode: MACHINE_FUEL_USAGE_VARIANCE_ALERT_CODE,
        });
      }
      return;
    }

    const machinery = await machineryRepository.findById(
      input.machineryId,
      input.domainId,
      input.adminId,
    );
    if (!machinery) return;
    const uom = await uomRepository.findByIdAndDomain(
      input.fuelUomId,
      input.domainId,
    );
    const unit = uom?.code ?? 'units';
    const roundedCurrent = Math.round(result.current * 100) / 100;
    const roundedAverage = Math.round(result.average * 100) / 100;
    const roundedDifference = Math.round(result.differencePercent * 100) / 100;
    const title = `Machine Fuel Usage ${result.direction === 'HIGH' ? 'High' : 'Low'}`;
    const message = `${machinery.code} used ${roundedCurrent} ${unit} on ${input.usageDate}, ${roundedDifference}% ${result.direction.toLowerCase()}er than its ${roundedAverage} ${unit} daily average.`;

    await createAlert({
      machineryId: input.machineryId,
      domainId: input.domainId,
      adminId: input.adminId,
      usageDate: input.usageDate,
      alertCode: MACHINE_FUEL_USAGE_VARIANCE_ALERT_CODE,
      title,
      message,
      severity: rule.severity,
      metadata: {
        usageDate: input.usageDate,
        machineryId: input.machineryId,
        projectId: input.projectId,
        fuelType: input.fuelType,
        fuelUomId: input.fuelUomId,
        currentDailyUsage: roundedCurrent,
        averageDailyUsage: roundedAverage,
        differencePercent: roundedDifference,
        direction: result.direction,
        historyDaysUsed: historicalValues.length,
      },
    });
  },

  async checkRuntime(input: MachineryRuntimeAlertJobPayload): Promise<void> {
    const rule = await getRule(
      input.domainId,
      input.adminId,
      MACHINE_RUNTIME_VARIANCE_ALERT_CODE,
      'Machine Runtime Variance',
      'Triggers when machinery daily runtime differs from its historical daily average.',
    );
    if (!rule.isEnabled || rule.status !== 'ACTIVE') return;

    const config = readConfig(rule.config);
    const targetStart = parseUsageDate(input.usageDate);
    const targetEnd = addUtcDays(targetStart, 1);
    const historyStart = addUtcDays(targetStart, -config.historyDays);
    const context: MachineryRuntimeContext = {
      machineryId: input.machineryId,
      projectId: input.projectId,
      domainId: input.domainId,
      adminId: input.adminId,
    };
    const rows = await movementLogRepository.findMachineryDailyRuntime(
      context,
      historyStart,
      targetEnd,
    );
    const historicalValues = rows
      .filter((row) => row.usageDate !== input.usageDate)
      .map((row) => Number(row.totalHours));
    const current = Number(
      rows.find((row) => row.usageDate === input.usageDate)?.totalHours ?? 0,
    );
    const result = calculateVariance(
      historicalValues,
      current,
      config,
      input.completedDay === true,
    );

    if (!result) {
      if (input.completedDay) {
        await resolveNormalAlert({
          ...input,
          alertCode: MACHINE_RUNTIME_VARIANCE_ALERT_CODE,
        });
      }
      return;
    }

    const machinery = await machineryRepository.findById(
      input.machineryId,
      input.domainId,
      input.adminId,
    );
    if (!machinery) return;
    const roundedCurrent = Math.round(result.current * 100) / 100;
    const roundedAverage = Math.round(result.average * 100) / 100;
    const roundedDifference = Math.round(result.differencePercent * 100) / 100;
    const title = `Machine Runtime ${result.direction === 'HIGH' ? 'High' : 'Low'}`;
    const message = `${machinery.code} ran ${roundedCurrent} hours on ${input.usageDate}, ${roundedDifference}% ${result.direction.toLowerCase()}er than its ${roundedAverage}-hour daily average.`;

    await createAlert({
      machineryId: input.machineryId,
      domainId: input.domainId,
      adminId: input.adminId,
      usageDate: input.usageDate,
      alertCode: MACHINE_RUNTIME_VARIANCE_ALERT_CODE,
      title,
      message,
      severity: rule.severity,
      metadata: {
        usageDate: input.usageDate,
        machineryId: input.machineryId,
        projectId: input.projectId,
        currentDailyRuntime: roundedCurrent,
        averageDailyRuntime: roundedAverage,
        differencePercent: roundedDifference,
        direction: result.direction,
        historyDaysUsed: historicalValues.length,
      },
    });
  },

  async checkCompletedDay(usageDate: string): Promise<void> {
    const targetStart = parseUsageDate(usageDate);
    const targetEnd = addUtcDays(targetStart, 1);
    const historyStart = addUtcDays(targetStart, -DEFAULT_HISTORY_DAYS);
    const [fuelContexts, runtimeContexts] = await Promise.all([
      fuelLogRepository.findMachineryUsageContexts(historyStart, targetEnd),
      movementLogRepository.findMachineryRuntimeContexts(
        historyStart,
        targetEnd,
      ),
    ]);

    for (const context of fuelContexts) {
      await machineryVarianceAlertService.checkFuelUsage({
        ...context,
        usageDate,
        completedDay: true,
      });
    }

    for (const context of runtimeContexts) {
      await machineryVarianceAlertService.checkRuntime({
        ...context,
        usageDate,
        completedDay: true,
      });
    }
  },
};
