import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import variables from '@/config/variables.config';

function getRequiredS3Config() {
  const {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,
    AWS_BUCKET_NAME,
  } = variables;

  if (
    !AWS_ACCESS_KEY_ID ||
    !AWS_SECRET_ACCESS_KEY ||
    !AWS_REGION ||
    !AWS_BUCKET_NAME
  ) {
    throw new Error('invalid aws s3 config');
  }

  return {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION,
    bucketName: AWS_BUCKET_NAME,
  };
}

const s3Config = getRequiredS3Config();

const s3 = new S3Client({
  region: s3Config.region,
  credentials: {
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
  },
});

export const uploadToS3 = async (file: Express.Multer.File, folder: string) => {
  const key = `${folder}/${Date.now()}-${file.originalname}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: s3Config.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  return `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${encodeURI(key)}`;
};

export const deleteFromS3 = async (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const key = decodeURIComponent(parsedUrl.pathname.replace(/^\//, ''));

    await s3.send(
      new DeleteObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
      }),
    );
  } catch (error) {
    console.error('Error deleting from S3:', error);
  }
};
