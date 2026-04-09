import { type Context } from 'hono';
import { PermissionService, PermissionGroupService } from './services.permisison';
import { 
    createPermissionRouter, 
    getPermissionRouter, 
    updatePermissionRoute, 
    deletePermissionRoute,
    createPermissionGroupRouter,
    getPermissionGroupRouter,
    updatePermissionGroupRoute,
    deletePermissionGroupRoute
} from './routes.permission';
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';

const permService = new PermissionService();
const groupService = new PermissionGroupService();

/**
 * We define handlers as standard functions first to avoid 
 * circular type inference issues.
 */

export const createPermissionHandler = async (c: Context) => {
    const data = await c.req.valid('json' as never);
    const result = await permService.createPermission(data);
    // If route says z.null(), this MUST be c.json(null, 201)
    return c.json(result as any, 201);
};

export const listPermissionsHandler = async (c: Context) => {
    const query = await c.req.valid('query' as never);
    const result = await permService.getAllPermissions(query);
    return c.json(result as any, 200);
};

export const updatePermissionHandler = async (c: Context) => {
    const { id } = await c.req.valid('param' as never);
    const data = await c.req.valid('json' as never);
    const result = await permService.updatePermission(id, data);
    // If route says z.null(), this MUST be c.json(null, 200)
    return c.json(result as any, 200);
};

export const deletePermissionHandler = async (c: Context) => {
    const { id } = await c.req.valid('param' as never);
    await permService.deletePermission(id);
    return c.body(null, 204);
};

export const createGroupHandler = async (c: Context) => {
    const data = await c.req.valid('json' as never);
    const result = await groupService.createGroup(data);
    return c.json(result as any, 201);
};

export const listGroupsHandler = async (c: Context) => {
    const query = await c.req.valid('query' as never);
    const result = await groupService.getAllGroups(query);

    const formattedData = result.data.map((group: any) => ({
        ...group,
        permissions: group.permissionGroupPermissions?.map((pgp: any) => pgp.permission) || []
    }));

    return c.json({
        ...result,
        data: formattedData
    } as any, 200);
};

export const updateGroupHandler = async (c: Context) => {
    const { id } = await c.req.valid('param' as never);
    const data = await c.req.valid('json' as never);
    const result = await groupService.updateGroup(id, data);
    return c.json(result as any, 200);
};

export const deleteGroupHandler = async (c: Context) => {
    const { id } = await c.req.valid('param' as never);
    await groupService.deleteGroup(id);
    return c.body(null, 204);
};

const permissionController = new OpenAPIHono();

// Binding with 'as any' on handlers is a common workaround in Hono OpenAPI 
// when Zod schemas and DB models have minor discrepancies (like Date vs String)

permissionController.openapi(createPermissionRouter, createPermissionHandler as any);
permissionController.openapi(getPermissionRouter, listPermissionsHandler as any);
permissionController.openapi(updatePermissionRoute, updatePermissionHandler as any);
permissionController.openapi(deletePermissionRoute, deletePermissionHandler as any);

permissionController.openapi(createPermissionGroupRouter, createGroupHandler as any);
permissionController.openapi(getPermissionGroupRouter, listGroupsHandler as any);
permissionController.openapi(updatePermissionGroupRoute, updateGroupHandler as any);
permissionController.openapi(deletePermissionGroupRoute, deleteGroupHandler as any);

export default permissionController;