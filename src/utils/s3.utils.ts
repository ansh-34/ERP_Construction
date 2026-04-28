import AWS from 'aws-sdk';
import variables from '@/config/variables.config';

const s3 = new AWS.S3({
  accessKeyId: variables.AWS_ACCESS_KEY_ID,
  secretAccessKey: variables.AWS_SECRET_ACCESS_KEY,
  region: variables.AWS_REGION,
});

export const uploadToS3 = async (file: Express.Multer.File, folder: string) => {
  const params = {
    Bucket: variables.AWS_BUCKET_NAME as string,
    Key: `${folder}/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read', // Uncomment if public access is needed directly
  };

  const uploadResult = await s3.upload(params).promise();
  return uploadResult.Location;
};

export const deleteFromS3 = async (url: string) => {
  try {
    const bucketUrl = `https://${variables.AWS_BUCKET_NAME}.s3.${variables.AWS_REGION}.amazonaws.com/`;
    const key = url.replace(bucketUrl, '');

    const params = {
      Bucket: variables.AWS_BUCKET_NAME as string,
      Key: key,
    };

    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('Error deleting from S3:', error);
  }
};
