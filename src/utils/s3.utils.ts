import {
  DeleteObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import variables from '@/config/variables.config';

const s3Client = new S3Client({
  region: variables.AWS_REGION,
  ...(variables.AWS_ACCESS_KEY_ID && variables.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: variables.AWS_ACCESS_KEY_ID,
          secretAccessKey: variables.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

const objectAcl = variables.S3_OBJECT_ACL as ObjectCannedACL;

function safeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function safeFolderPath(folder: string): string {
  return folder
    .split('/')
    .map((part) => safeFileName(part))
    .filter(Boolean)
    .join('/');
}

function assertS3Bucket(): string {
  if (!variables.S3_BUCKET) {
    throw new Error('S3 bucket is not configured');
  }

  return variables.S3_BUCKET;
}

function buildS3Url(bucket: string, key: string): string {
  if (variables.S3_PUBLIC_URL) {
    return `${variables.S3_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
  }

  return `https://${bucket}.s3.${variables.AWS_REGION}.amazonaws.com/${key}`;
}

function getS3KeyFromUrl(url: string, bucket: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const publicBaseUrl = variables.S3_PUBLIC_URL;

    if (publicBaseUrl && url.startsWith(publicBaseUrl.replace(/\/$/, ''))) {
      return decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ''));
    }

    if (!parsedUrl.hostname.includes(bucket)) {
      return null;
    }

    return decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ''));
  } catch {
    return null;
  }
}

export const uploadToS3 = async (
  file: Express.Multer.File,
  folder: string,
): Promise<string> => {
  const bucket = assertS3Bucket();
  const safeFolder = safeFolderPath(folder);
  const key = `${safeFolder}/${Date.now()}-${safeFileName(file.originalname)}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: objectAcl,
    }),
  );

  return buildS3Url(bucket, key);
};

export const deleteFromS3 = async (url: string): Promise<void> => {
  try {
    const bucket = assertS3Bucket();
    const key = getS3KeyFromUrl(url, bucket);

    if (!key) {
      return;
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  } catch {
    // Best-effort cleanup.
  }
};
