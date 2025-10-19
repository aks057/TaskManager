import { Client } from 'minio';
import { env } from './env';

export const minioClient = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

export const initializeMinIO = async (): Promise<void> => {
  try {
    // Check if bucket exists, if not create it
    const bucketExists = await minioClient.bucketExists(env.MINIO_BUCKET);

    if (!bucketExists) {
      await minioClient.makeBucket(env.MINIO_BUCKET, 'us-east-1');
      console.log(`✅ MinIO bucket "${env.MINIO_BUCKET}" created successfully`);
    } else {
      console.log(`✅ MinIO bucket "${env.MINIO_BUCKET}" already exists`);
    }
  } catch (error) {
    console.error('❌ MinIO initialization error:', error);
    throw error;
  }
};
