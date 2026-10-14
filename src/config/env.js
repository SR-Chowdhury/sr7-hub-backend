import dotenv from 'dotenv';
dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET'];
for (const k of required) {
  if (!process.env[k]) throw new Error(`Missing required env var: ${k}`);
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim()),
};