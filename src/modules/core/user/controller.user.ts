import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { UserService } from './services.user';
import { 
    UserQueryParamsSchema, 
    CreateUserSchema, 
    UpdateUserSchema, 
    UserObjectSchema, 
    LoginSchema,
    UserPaginatedResponseSchema 
} from './schemas.user';
import { hasBrowserAgent } from '../../../hooks/browser.hooks';
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { JwtService } from '../auth/jwt.auth';


const userService = new UserService();

export const userController = new OpenAPIHono();


// --- Route Definitions ---

const getUsersRoute = createRoute({
    method: 'get',
    path: '/',
    request: { query: UserQueryParamsSchema },
    responses: {
        200: {
            content: { 'application/json': { schema: UserPaginatedResponseSchema } },
            description: 'Retrieve paginated users',
        },
    },
    tags: ['Users'],
});

const createUserRoute = createRoute({
    method: 'post',
    path: '/',
    request: {
        body: { content: { 'application/json': { schema: CreateUserSchema } } },
    },
    responses: {
        201: {
            description: 'User created successfully',
        },
        400: {
            description: 'Validation error or User already exists',
        },
    },
    tags: ['Users'],
});

const updateUserRoute = createRoute({
    method: 'patch',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
        body: { content: { 'application/json': { schema: UpdateUserSchema } } },
    },
    responses: {
        200: {
            content: { 'application/json': { schema: UserObjectSchema } },
            description: 'User updated successfully',
        },
    },
    tags: ['Users'],
});

const deleteUserRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
    },
    responses: {
        200: {
            content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
            description: 'User deleted successfully',
        },
    },
    tags: ['Users'],
});

// --- Implementation ---

userController.openapi(getUsersRoute, async (c) => {
    const query = c.req.valid('query');
    const result = await userService.getAllUsers(query);
    return c.json(result, 200);
});

userController.openapi(createUserRoute, async (c) => {
    const body = c.req.valid('json');
    try {
        await userService.createUser(body);
        return c.body(null, 201); // Specifically returning null/no content
    } catch (error: any) {
        return c.json({ message: error.message }, 400);
    }
});

userController.openapi(updateUserRoute, async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const result = await userService.updateUser(id, body);
    return c.json(result, 200);
});

userController.openapi(deleteUserRoute, async (c) => {
    const { id } = c.req.valid('param');
    const result = await userService.deleteUser(id);
    return c.json(result, 200);
});

