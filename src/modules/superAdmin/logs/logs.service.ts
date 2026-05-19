import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

export const LogsService = {
  async listLogs() {
    const S3_BUCKET = process.env.S3_BUCKET || process.env.AWS_BUCKET_NAME;
    const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
    const S3_PREFIX = 'logs/';

    if (!S3_BUCKET) {
      throw new Error('S3_BUCKET or AWS_BUCKET_NAME is not configured.');
    }

    const s3 = new S3Client({ region: AWS_REGION });
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: S3_PREFIX,
    });

    const response = await s3.send(command);
    
    // Format the list
    const logs = (response.Contents || [])
      .filter((item) => item.Key && item.Key !== S3_PREFIX) 
      .map((item) => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
      }));

    return logs;
  },
};
