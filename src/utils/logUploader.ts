import cron from 'node-cron';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { pipeline } from 'stream/promises';

const LOG_DIR = path.join(process.cwd(), 'logs');
const S3_BUCKET = process.env.S3_BUCKET!;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const S3_PREFIX = 'logs/';
const MAX_RETRY_DAYS = 7;

if (!S3_BUCKET) throw new Error('S3_BUCKET env variable is required');

const s3 = new S3Client({ region: AWS_REGION });
let isRunning = false;

// Helpers

function getLogFileName(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `log${dd}${mm}${yyyy}.log`;
}

async function deleteIfExists(filePath: string): Promise<void> {
  try {
    await fs.promises.unlink(filePath);
    console.log(`[LogUploader] Deleted: ${path.basename(filePath)}`);
  } catch (err: any) {
    if (err.code !== 'ENOENT') throw err; 
  }
}

async function objectExists(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function gzipFile(source: string, destination: string): Promise<void> {
  await pipeline(
    fs.createReadStream(source),
    zlib.createGzip(),
    fs.createWriteStream(destination)
  );
}

//  Core upload 

async function uploadLogFile(date: Date): Promise<void> {
  const fileName = getLogFileName(date);
  const filePath = path.join(LOG_DIR, fileName);
  const gzipFileName = `${fileName}.gz`;
  const gzipFilePath = path.join(LOG_DIR, gzipFileName);
  const s3Key = `${S3_PREFIX}${gzipFileName}`;

  if (!fs.existsSync(filePath)) {
    console.log(`[LogUploader] Not found, skipping: ${fileName}`);
    return;
  }

  // Already in S3 — clean up any local remnants and exit
  if (await objectExists(s3Key)) {
    console.log(`[LogUploader] Already in S3: ${gzipFileName}`);
    await deleteIfExists(filePath);
    await deleteIfExists(gzipFilePath); // clean stale .gz
    return;
  }

  // Compress
  await gzipFile(filePath, gzipFilePath);
  const { size: compressedSize } = await fs.promises.stat(gzipFilePath);

  // Upload with stream — destroy stream explicitly on failure
  const gzipStream = fs.createReadStream(gzipFilePath);
  try {
    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: gzipStream,
      ContentType: 'application/gzip',
      Metadata: {
        'original-filename': fileName,
        'compressed-size-bytes': String(compressedSize),
        'uploaded-at': new Date().toISOString(),
      },
    }));
  } catch (err) {
    gzipStream.destroy(); // release file handle on failure
    throw err;
  }

  console.log(`[LogUploader] Uploaded: ${gzipFileName} (${compressedSize} bytes)`);

  // Verify upload before deleting source 
  if (!(await objectExists(s3Key))) {
    throw new Error(`[LogUploader] S3 verification failed for ${s3Key} — local files retained`);
  }

  // Safe to delete only after verified
  await deleteIfExists(filePath);
  await deleteIfExists(gzipFilePath);
}

//  Scheduler 

async function uploadAndDeleteLog(): Promise<void> {
  if (isRunning) {
    console.log('[LogUploader] Previous job still running, skipping');
    return;
  }
  isRunning = true;

  try {
    for (let daysAgo = 1; daysAgo <= MAX_RETRY_DAYS; daysAgo++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - daysAgo);
      try {
        await uploadLogFile(targetDate);
      } catch (err: any) {
        console.error(`[LogUploader] Failed for day -${daysAgo}:`, err.message);
      }
    }
  } finally {
    isRunning = false;
  }
}

export const startLogUploader = () => {
  uploadAndDeleteLog().catch((err) => {
    console.error('[LogUploader] Initial run failed:', err);
  });

  cron.schedule('0 0 * * *', uploadAndDeleteLog, {
    timezone: 'Asia/Kolkata',
  });

  console.log('[LogUploader] Scheduler started — uploads daily at midnight IST');
};