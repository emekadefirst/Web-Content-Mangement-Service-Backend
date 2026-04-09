import { PermissionGroup } from "../modules/core/permission/models.permission";
import { HTTPException } from "hono/http-exception";
import { createMiddleware } from 'hono/factory'

export const checkPermission = (requiredSlug: string) => {
    return createMiddleware(async (c, next) => {
        const user = c.get('currentUser');
        const userPermissions = c.get('userPermissions'); 

        if (user?.role === 'admin') return await next();

        if (!userPermissions.includes(requiredSlug)) {
            throw new HTTPException(403, { 
                message: `Forbidden: Missing permission ${requiredSlug}` 
            });
        }

        await next();
    });
};