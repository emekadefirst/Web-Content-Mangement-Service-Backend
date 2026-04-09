import path from 'path';

export const DB_HOST = Bun.env.DB_HOST;
export const DB_PORT = Bun.env.DB_PORT;
export const DB_DATABASE = Bun.env.DB_DATABASE;
export const DB_USER = Bun.env.DB_USER;
export const DB_PASSWORD = Bun.env.DB_PASSWORD;

export const CLOUDINARY_CLOUD_NAME = Bun.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = Bun.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = Bun.env.CLOUDINARY_API_SECRET;
export const CLOUDINARY_URL = Bun.env.CLOUDINARY_URL;



export const SMTP_HOST = Bun.env.SMTP_HOST;
export const SMTP_PORT = Bun.env.SMTP_PORT;
export const SMTP_USER = Bun.env.SMTP_USER;
export const SMTP_PASSWORD = Bun.env.SMTP_PASSWORD;

export const AUTH_SECRET = Bun.env.AUTH_SECRET;

export const REDIS_URL = Bun.env.REDIS_URL || 'redis://localhost:6379';


export const RABBITMQ_URL = Bun.env.RABBITMQ_URL || "amqp://happyfit:happyfit123@localhost:5672";



export const DBURL = `postgresql://${encodeURIComponent(DB_USER || '')}:${encodeURIComponent(DB_PASSWORD || '')}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;