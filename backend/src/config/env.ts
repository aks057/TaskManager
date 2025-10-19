import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRY: string;
  JWT_REFRESH_EXPIRY: string;
  MINIO_ENDPOINT: string;
  MINIO_PORT: number;
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
  MINIO_BUCKET: string;
  MINIO_USE_SSL: boolean;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  REDIS_URL?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM?: string;
  APP_NAME?: string;
  FRONTEND_URL?: string;
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

export const env: EnvConfig = {
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVariable('PORT', '5000'), 10),
  MONGODB_URI: getEnvVariable('MONGODB_URI'),
  JWT_ACCESS_SECRET: getEnvVariable('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: getEnvVariable('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRY: getEnvVariable('JWT_ACCESS_EXPIRY', '15m'),
  JWT_REFRESH_EXPIRY: getEnvVariable('JWT_REFRESH_EXPIRY', '7d'),
  MINIO_ENDPOINT: getEnvVariable('MINIO_ENDPOINT', 'localhost'),
  MINIO_PORT: parseInt(getEnvVariable('MINIO_PORT', '9000'), 10),
  MINIO_ACCESS_KEY: getEnvVariable('MINIO_ACCESS_KEY', 'minioadmin'),
  MINIO_SECRET_KEY: getEnvVariable('MINIO_SECRET_KEY', 'minioadmin'),
  MINIO_BUCKET: getEnvVariable('MINIO_BUCKET', 'task-files'),
  MINIO_USE_SSL: getEnvVariable('MINIO_USE_SSL', 'false') === 'true',
  CORS_ORIGIN: getEnvVariable('CORS_ORIGIN', 'http://localhost:3000'),
  RATE_LIMIT_WINDOW: parseInt(getEnvVariable('RATE_LIMIT_WINDOW', '15'), 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(getEnvVariable('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
  REDIS_URL: process.env.REDIS_URL,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  APP_NAME: process.env.APP_NAME || 'Task Manager',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};
