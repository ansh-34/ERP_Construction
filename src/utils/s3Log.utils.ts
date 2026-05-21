import { readFile } from 'fs/promises';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import variables from '@/config/variables.config';

let s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({ region: variables.AWS_REGION });
  }
  return s3Client;
}

export function getLogS3Key(fileName: string): string {
  const prefix = variables.S3_LOG_PREFIX.endsWith('/')
    ? variables.S3_LOG_PREFIX
    : `${variables.S3_LOG_PREFIX}/`;
  return `${prefix}${fileName}`;
}

export function assertS3Configured(): void {
  if (!variables.S3_BUCKET) {
    throw new Error('S3_BUCKET or AWS_BUCKET_NAME is not configured');
  }
}

export async function uploadLogFileToS3(
  filePath: string,
  fileName: string,
): Promise<string> {
  assertS3Configured();

  const body = await readFile(filePath);
  const key = getLogS3Key(fileName);

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: variables.S3_BUCKET!,
      Key: key,
      Body: body,
      ContentType: 'text/plain',
    }),
  );

  return key;
}
