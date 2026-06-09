import { ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import variables from '@/config/variables.config';
import { assertS3Configured, getS3Client } from '@/utils/s3Log.utils';
import type { AnalyticsQuery } from './logs.validator';
import { DbAnalyticsRepository } from '@/repositories/index';

type AnalyticsPeriod = AnalyticsQuery['period'];

function parseAnchorDate(date?: string): Date {
  if (date) {
    const parsed = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error('Invalid date');
    }
    return parsed;
  }
  const today = new Date();
  return new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
}

function getDateRange(period: AnalyticsPeriod, anchor: Date) {
  if (period === 'day') {
    return { start: anchor, end: anchor };
  }

  if (period === 'week') {
    const day = anchor.getUTCDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(anchor);
    start.setUTCDate(anchor.getUTCDate() + diffToMonday);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);
    return { start, end };
  }

  const start = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1),
  );
  const end = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 0),
  );
  return { start, end };
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

type DbAnalyticsRow = Awaited<
  ReturnType<typeof DbAnalyticsRepository.findManyByDateRange>
>[number];

function buildSummary(rows: DbAnalyticsRow[]) {
  if (rows.length === 0) {
    return {
      totalRequests: 0,
      successCount: 0,
      failureCount: 0,
      avgResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: 0,
      mostHitApi: null,
      mostHitCount: 0,
      mostFailedApi: null,
      mostFailedCount: 0,
    };
  }

  let totalRequests = 0;
  let successCount = 0;
  let failureCount = 0;
  let weightedResponseSum = 0;
  let maxResponseTime = rows[0].maxResponseTime;
  let minResponseTime = rows[0].minResponseTime;
  let mostHitApi = rows[0].mostHitApi;
  let mostHitCount = 0;
  let mostFailedApi: string | null = null;
  let mostFailedCount = 0;

  for (const row of rows) {
    totalRequests += row.totalRequests;
    successCount += row.successCount;
    failureCount += row.failureCount;
    weightedResponseSum += row.avgResponseTime * row.totalRequests;
    maxResponseTime = Math.max(maxResponseTime, row.maxResponseTime);
    minResponseTime = Math.min(minResponseTime, row.minResponseTime);

    if (row.mostHitCount > mostHitCount) {
      mostHitCount = row.mostHitCount;
      mostHitApi = row.mostHitApi;
    }

    if (row.mostFailedCount > mostFailedCount) {
      mostFailedCount = row.mostFailedCount;
      mostFailedApi = row.mostFailedApi;
    }
  }

  return {
    totalRequests,
    successCount,
    failureCount,
    avgResponseTime:
      totalRequests > 0 ? weightedResponseSum / totalRequests : 0,
    maxResponseTime,
    minResponseTime,
    mostHitApi,
    mostHitCount,
    mostFailedApi,
    mostFailedCount,
  };
}

export const LogsService = {
  async listLogs() {
    assertS3Configured();

    const prefix = variables.S3_LOG_PREFIX.endsWith('/')
      ? variables.S3_LOG_PREFIX
      : `${variables.S3_LOG_PREFIX}/`;

    const response = await getS3Client().send(
      new ListObjectsV2Command({
        Bucket: variables.S3_BUCKET!,
        Prefix: prefix,
      }),
    );

    const items = (response.Contents || []).filter(
      (item) => item.Key && item.Key !== prefix,
    );

    const logsWithUrls = await Promise.all(
      items.map(async (item) => {
        const downloadUrl = await getSignedUrl(
          getS3Client(),
          new GetObjectCommand({
            Bucket: variables.S3_BUCKET!,
            Key: item.Key!,
          }),
          { expiresIn: 3600 },
        );

        return {
          key: item.Key,
          fileName: item.Key!.replace(prefix, ''),
          // size: item.Size,
          // lastModified: item.LastModified,
          s3Uri: `s3://${variables.S3_BUCKET}/${item.Key}`,
          downloadUrl,
        };
      }),
    );

    return logsWithUrls;
  },

  async getAnalytics(query: AnalyticsQuery) {
    const anchor = parseAnchorDate(query.date);
    const { start, end } = getDateRange(query.period, anchor);

    const rows = await DbAnalyticsRepository.findManyByDateRange(start, end);

    const daily = await Promise.all(
      rows.map(async (row) => {
        let downloadUrl: string | null = null;
        if (row.fileUrl) {
          try {
            downloadUrl = await getSignedUrl(
              getS3Client(),
              new GetObjectCommand({
                Bucket: variables.S3_BUCKET!,
                Key: row.fileUrl,
              }),
              { expiresIn: 3600 },
            );
          } catch {
            // S3 not configured or key not found — leave null
          }
        }
        return {
          date: formatDateOnly(row.date),
          downloadUrl,
        };
      }),
    );

    return {
      period: query.period,
      dateRange: {
        from: formatDateOnly(start),
        to: formatDateOnly(end),
      },
      summary: buildSummary(rows),
      daily,
    };
  },
};
