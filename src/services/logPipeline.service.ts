import fs from 'fs/promises';
import variables from '@/config/variables.config';
import { processLogAnalyticsForDate } from '@/services/logAnalytics.service';
import { uploadLogFileToS3 } from '@/utils/s3Log.utils';
import {
  ensureLogDir,
  formatLogDate,
  getLogFileName,
  getLogFilePath,
  getYesterday,
} from '@/utils/logFile.utils';

export type NightlyLogJobResult = {
  fileName: string;
  analyticsSaved: boolean;
  s3Uploaded: boolean;
  localFileDeleted: boolean;
  s3Key?: string;
  skipped?: boolean;
};

let jobRunning = false;

export async function runNightlyLogPipeline(): Promise<NightlyLogJobResult> {
  const date = getYesterday();
  const fileName = getLogFileName(date);
  const filePath = getLogFilePath(date);

  const baseResult: NightlyLogJobResult = {
    fileName,
    analyticsSaved: false,
    s3Uploaded: false,
    localFileDeleted: false,
  };

  if (jobRunning) {
    console.warn('[LogPipeline] Previous job still running — skipping');
    return { ...baseResult, skipped: true };
  }

  jobRunning = true;
  console.log(
    `[LogPipeline] Starting nightly job for ${formatLogDate(date)} (${fileName})`,
  );

  try {
    let analyticsSaved: boolean;
    try {
      analyticsSaved = await processLogAnalyticsForDate(date);
    } catch (error) {
      console.error('[LogPipeline] Analytics step threw:', error);
      return baseResult;
    }

    if (!analyticsSaved) {
      console.warn(
        `[LogPipeline] Analytics not saved for ${fileName} — aborting S3 upload`,
      );
      return baseResult;
    }

    console.log(`[LogPipeline] Analytics saved to database for ${fileName}`);

    if (!variables.S3_BUCKET) {
      console.log(
        '[LogPipeline] S3 bucket not configured — local log file retained',
      );
      return { ...baseResult, analyticsSaved: true };
    }

    try {
      const s3Key = await uploadLogFileToS3(filePath, fileName);
      console.log(
        `[LogPipeline] Uploaded to S3: s3://${variables.S3_BUCKET}/${s3Key}`,
      );

      await fs.unlink(filePath);
      console.log(`[LogPipeline] Deleted local file: ${filePath}`);

      return {
        fileName,
        analyticsSaved: true,
        s3Uploaded: true,
        localFileDeleted: true,
        s3Key,
      };
    } catch (error) {
      console.error(
        '[LogPipeline] S3 upload failed — local log retained:',
        error,
      );
      return { ...baseResult, analyticsSaved: true };
    }
  } finally {
    jobRunning = false;
  }
}

export async function runLogPipelineForDate(
  date: Date,
): Promise<NightlyLogJobResult> {
  const fileName = getLogFileName(date);
  const filePath = getLogFilePath(date);

  const baseResult: NightlyLogJobResult = {
    fileName,
    analyticsSaved: false,
    s3Uploaded: false,
    localFileDeleted: false,
  };

  try {
    const analyticsSaved = await processLogAnalyticsForDate(date);
    if (!analyticsSaved) {
      return baseResult;
    }

    if (!variables.S3_BUCKET) {
      return { ...baseResult, analyticsSaved: true };
    }

    const s3Key = await uploadLogFileToS3(filePath, fileName);
    await fs.unlink(filePath);

    return {
      fileName,
      analyticsSaved: true,
      s3Uploaded: true,
      localFileDeleted: true,
      s3Key,
    };
  } catch (error) {
    console.error(`[LogPipeline] Manual run failed for ${fileName}:`, error);
    return baseResult;
  }
}

export function initLogPipeline(): void {
  ensureLogDir();
}
