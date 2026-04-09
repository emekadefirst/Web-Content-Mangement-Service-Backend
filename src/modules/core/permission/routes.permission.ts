import { createRoute, z } from "@hono/zod-openapi";
import { 
    PermissionQuerySchema, 
    PermissionGroupQuerySchema, 
    PaginatedPermissionResponseSchema, 
    PaginatedPermGroupResponseSchema, 
    createPermissionSchema, 
    createPermissionGroupSchema, 
    updatePermissionSchema, 
    updatePermissionGroupSchema  
} from './schemas.permisison';

const tags = {
    permission: ["Permission"],
    group: ["Permission Group"]
};

// --- Permission Routes ---

export const createPermissionRouter = createRoute({
    method: 'post',
    path: '/',
    tags: tags.permission,
    request: { 
        body: { 
            content: { 'application/json': { schema: createPermissionSchema } } 
        } 
    },
    responses: {
        201: { 
            description: 'Permission created successfully',
            content: { 'application/json': { schema: z.null() } }
        },
        400: { description: 'Invalid input' },
        403: { description: 'Unauthorized' },
        500: { description: 'Internal Server Error' }
    }
});

export const getPermissionRouter = createRoute({
    method: 'get',
    path: '/',
    tags: tags.permission,
    request: { query: PermissionQuerySchema },
    responses: {
        200: { 
            description: 'List of permissions',
            content: { 'application/json': { schema: PaginatedPermissionResponseSchema } }
        },
        500: { description: 'Internal Server Error' }
    }
});

export const updatePermissionRoute = createRoute({
    method: 'patch',
    path: '/{id}',
    tags: tags.permission,
    request: {
        params: z.object({ id: z.string().uuid() }),
        body: { content: { 'application/json': { schema: updatePermissionSchema } } },
    },
    responses: {
        200: {
            description: 'Permission updated successfully',
            content: { 'application/json': { schema: z.null() } },
        },
    }
});

export const deletePermissionRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags: tags.permission,
    request: {
        params: z.object({ id: z.string().uuid() })
    },
    responses: {
        204: {
            description: 'Permission deleted successfully',
        },
    }
});

// --- Permission Group Routes ---

export const createPermissionGroupRouter = createRoute({
    method: 'post',
    path: '/groups',
    tags: tags.group, // Fixed tag reference
    request: { 
        body: { 
            content: { 'application/json': { schema: createPermissionGroupSchema } } 
        } 
    },
    responses: {
        201: { 
            description: 'Group created successfully',
            content: { 'application/json': { schema: z.null() } }
        },
        400: { description: 'Invalid input' }
    }
});

export const getPermissionGroupRouter = createRoute({
    method: 'get',
    path: '/groups',
    tags: tags.group, // Fixed tag reference
    request: { query: PermissionGroupQuerySchema },
    responses: {
        200: { 
            description: 'List of groups',
            content: { 'application/json': { schema: PaginatedPermGroupResponseSchema } }
        }
    }
});

export const updatePermissionGroupRoute = createRoute({
    method: 'patch',
    path: '/groups/{id}',
    tags: tags.group, // Fixed tag reference
    request: {
        params: z.object({ id: z.string().uuid() }),
        body: { content: { 'application/json': { schema: updatePermissionGroupSchema } } },
    },
    responses: {
        200: {
            description: 'Permission Group updated successfully',
            content: { 'application/json': { schema: z.null() } },
        },
    }
});

export const deletePermissionGroupRoute = createRoute({
    method: 'delete',
    path: '/groups/{id}',
    tags: tags.group, // Fixed tag reference
    request: {
        params: z.object({ id: z.string().uuid() })
    },
    responses: {
        204: {
            description: 'Permission Group deleted successfully',
        },
    }
});