import { ContactService } from './services.contact';
import { OpenAPIHono } from '@hono/zod-openapi';
import { sendMessageRoute } from './routes.contact';


const contactRouter = new OpenAPIHono();

const contactService = new ContactService();


contactRouter.openapi(sendMessageRoute, async (c) => {
   
    const data = c.req.valid('json');
    const result = await contactService.sendMessage(data);
    return c.json(result, 200);
});

export default contactRouter;