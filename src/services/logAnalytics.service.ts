import fs from 'fs/promises';
import prisma from '@/infra/database/prisma/prisma.client';
import {
  getLogFilePath,
  getYesterday,
  getLogFileName,
  parseDateFromLogFileName,
} from '@/utils/logFile.utils';

type RequestLogEntry = {
  endpoint: string;
  statusCode: number;
  responseTime: number;
};

function isSuccessStatus(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 300;
}

function parseLogLine(line: string): RequestLogEntry | null {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const entry = JSON.parse(trimmed) as Partial<RequestLogEntry>;
    if (
      typeof entry.endpoint !== 'string' ||
      typeof entry.statusCode !== 'number' ||
      typeof entry.responseTime !== 'number' ||
      !Number.isFinite(entry.statusCode) ||
      !Number.isFinite(entry.responseTime)
    ) {
      return null;
    }
    return {
      endpoint: entry.endpoint,
      statusCode: entry.statusCode,
      responseTime: entry.responseTime,
    };
  } catch {
    return null;
  }
}

async function readLogEntries(filePath: string): Promise<RequestLogEntry[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const entries: RequestLogEntry[] = [];

  for (const line of content.split('\n')) {
    const entry = parseLogLine(line);
    if (entry) {
      entries.push(entry);
    }
  }

  return entries;
}

function aggregateEntries(entries: RequestLogEntry[]) {
  const endpointHits = new Map<string, number>();
  const endpointFailures = new Map<string, number>();

  let successCount = 0;
  let failureCount = 0;
  let responseTimeSum = 0;
  let maxResponseTime = entries[0].responseTime;
  let minResponseTime = entries[0].responseTime;

  for (const entry of entries) {
    if (isSuccessStatus(entry.statusCode)) {
      successCount += 1;
    } else {
      failureCount += 1;
      endpointFailures.set(
        entry.endpoint,
        (endpointFailures.get(entry.endpoint) ?? 0) + 1,
      );
    }

    endpointHits.set(
      entry.endpoint,
      (endpointHits.get(entry.endpoint) ?? 0) + 1,
    );

    responseTimeSum += entry.responseTime;
    maxResponseTime = Math.max(maxResponseTime, entry.responseTime);
    minResponseTime = Math.min(minResponseTime, entry.responseTime);
  }

  let mostHitApi = entries[0].endpoint;
  let mostHitCount = 0;
  for (const [endpoint, count] of endpointHits) {
    if (count > mostHitCount) {
      mostHitCount = count;
      mostHitApi = endpoint;
    }
  }

  let mostFailedApi: string | null = null;
  let mostFailedCount = 0;
  for (const [endpoint, count] of endpointFailures) {
    if (count > mostFailedCount) {
      mostFailedCount = count;
      mostFailedApi = endpoint;
    }
  }

  return {
    totalRequests: entries.length,
    successCount,
    failureCount,
    avgResponseTime: responseTimeSum / entries.length,
    maxResponseTime,
    minResponseTime,
    mostHitApi,
    mostHitCount,
    mostFailedApi,
    mostFailedCount,
  };
}

export async function processLogAnalyticsForDate(date: Date): Promise<boolean> {
  const fileName = getLogFileName(date);
  const filePath = getLogFilePath(date);
  const analyticsDate = parseDateFromLogFileName(fileName);

  if (!analyticsDate) {
    console.error(`[LogAnalytics] Invalid log file name: ${fileName}`);
    return false;
  }

  try {
    await fs.access(filePath);
  } catch {
    console.error(`[LogAnalytics] Log file not found: ${filePath}`);
    return false;
  }

  let entries: RequestLogEntry[];
  try {
    entries = await readLogEntries(filePath);
  } catch (error) {
    console.error(`[LogAnalytics] Failed to read ${fileName}:`, error);
    return false;
  }

  if (entries.length === 0) {
    console.warn(`[LogAnalytics] No valid entries in ${fileName} — skipping`);
    return false;
  }

  const stats = aggregateEntries(entries);

  try {
    await prisma.dbAnalytics.upsert({
      where: { date: analyticsDate },
      create: {
        date: analyticsDate,
        ...stats,
      },
      update: stats,
    });
  } catch (error) {
    console.error(
      `[LogAnalytics] Database save failed for ${fileName}:`,
      error,
    );
    return false;
  }

  console.log(
    `[LogAnalytics] Saved analytics for ${fileName} (${stats.totalRequests} requests)`,
  );
  return true;
}

export async function processYesterdayLogAnalytics(): Promise<boolean> {
  return processLogAnalyticsForDate(getYesterday());
}
