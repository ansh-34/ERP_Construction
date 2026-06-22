export const AlertJobs = {
  CHECK_MACHINERY_RUNTIME: 'alert.check.machinery-runtime',
  CHECK_MACHINERY_FUEL_USAGE: 'alert.check.machinery-fuel-usage',
  CHECK_DAILY_MACHINERY_VARIANCE: 'alert.check.daily-machinery-variance',
} as const;

export type AlertJobName = (typeof AlertJobs)[keyof typeof AlertJobs];
