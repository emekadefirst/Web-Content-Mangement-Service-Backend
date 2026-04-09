import { createRoute } from '@hono/zod-openapi';
import { createContactSchema, contactResponseSchema } from './schemas.contact';



export const sendMessageRoute = createRoute({
  method: 'post',
  path: '/contact',
  tags: ['Contact'],
  summary: 'Send a contact message',
  description: 'Validates contact form data and queues an email notification.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createContactSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: contactResponseSchema,
        },
      },
      description: 'Message successfully queued',
    },
    500: {
      description: 'Internal Server Error',
    },
  },
});