import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { pinoLogger } from './middleware/pino-logger.middleware';

// Routes
import { userController } from './modules/core/user/controller.user';
import authController from './modules/core/auth/controllers.auth';
import fileController from './modules/core/file/controller.file';
import blogController from './modules/public/blog/controller.blog';
import newsController from './modules/public/news/controller.news';
import categoryController from './modules/public/category/controller.category';
import faqController from './modules/public/faq/controller.faq';
import galleryController from './modules/public/gallery/controller.gallery';
import subscriberController from './modules/public/subscriber/controller.subscriber';
import contactRouter from './modules/public/contact/controllers.contact';
// Notification

import permissionController from './modules/core/permission/controllers.permission';

// await bootstrap();

const app = new OpenAPIHono();

app.use('*', pinoLogger);

app.get('/', (c) => c.text('Hello Bun!'));

// --- CORS Configuration ---
const trustedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5500',
];

interface CorsOptions {
  origin: (origin: string) => string;
  allowMethods: string[];
  allowHeaders: string[];
  exposeHeaders: string[];
  maxAge: number;
  credentials: boolean;
}

app.use('*', cors({
  origin: (origin?: string): string => {
    // Check if the request origin is in our trusted list
    if (origin && trustedOrigins.includes(origin)) {
      return origin;
    }
    return trustedOrigins[0] ?? '';
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
} as CorsOptions));

app.doc('/doc', {
  openapi: '3.0.0',
  info: { title: 'Part Central CMS API', version: '1.0.0' },
});

app.route('/v1/auth', authController);
app.route('/v1/users', userController);
app.route('/v1/contacts', contactRouter);
app.route('/v1/files', fileController);
app.route('/v1/blogs', blogController);
app.route('/v1/news', newsController);
app.route('/v1/categories', categoryController);
app.route('/v1/faqs', faqController);
app.route('/v1/galleries', galleryController);
app.route('/v1/subscribers', subscriberController);
app.route("/v1/permissions/", permissionController);



app.get('/docs', swaggerUI({ url: '/doc' }));


export default app;