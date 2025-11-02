import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.APP_PORT || '3000', 10),
  host: process.env.APP_HOST || '0.0.0.0',
  env: process.env.NODE_ENV || 'development',
  name: 'Fatal Model Backend',
  version: '1.0.0',
}));

export const databaseConfig = registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'fatal_model_db',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: 0,
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key',
  expiresIn: process.env.JWT_EXPIRATION || '3600s',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_key',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '604800s',
}));

export const awsConfig = registerAs('aws', () => ({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
  s3Bucket: process.env.AWS_S3_BUCKET,
}));

export const emailConfig = registerAs('email', () => ({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  from: process.env.EMAIL_FROM || 'noreply@fatal-model.com',
}));

export const openaiConfig = registerAs('openai', () => ({
  apiKey: process.env.OPENAI_API_KEY,
}));
