import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { db } from '../core/db.core';
import { HTTPException } from 'hono/http-exception';
import { JwtService } from '../modules/core/auth/jwt.auth';
import { eq, and } from 'drizzle-orm';
import { User } from '../modules/core/user/models.user';
import { 
    Permission, 
    PermissionGroup, 
    PermissionGroupPermissions 
} from '../modules/core/permission/models.permission';

// Define public paths for high-performance lookup
const PUBLIC_POST_PATHS = new Set([
    '/v1/auth/login',
    '/v1/auth/register',
    '/v1/auth/reset-password',
    '/v1/auth/verify-email',
    '/v1/auth/request-reset-password',
    '/v1/auth/verify-request-reset',
    '/v1/auth/google',
    '/v1/public/contact'
]);

export const AuthMiddleware = createMiddleware(async (c, next) => {
    const path = c.req.path;
    const method = c.req.method;

    // 1. Skip Auth for public POST routes
    if (method === 'POST' && PUBLIC_POST_PATHS.has(path)) {
        return await next();
    }

    // 2. Extract Token
    const token = getCookie(c, 'accessToken') || c.req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        throw new HTTPException(401, { message: 'Unauthorized: No token provided' });
    }

    // 3. Verify JWT
    const payload = await JwtService.verifyToken(token, 'access');
    if (!payload?.sub || typeof payload.sub !== 'string') {
        throw new HTTPException(401, { message: 'Invalid or expired token' });
    }

    // 4. Fetch User with Permissions via Joins
    // We join User -> Group -> GroupPermissions -> Permission
    const result = await db
        .select({
            user: User,
            permissionSlug: Permission.slug
        })
        .from(User)
        .leftJoin(PermissionGroup, eq(User.permissionGroupId, PermissionGroup.id))
        .leftJoin(PermissionGroupPermissions, eq(PermissionGroup.id, PermissionGroupPermissions.permissionGroupId))
        .leftJoin(Permission, eq(PermissionGroupPermissions.permissionId, Permission.id))
        .where(eq(User.id, payload.sub));

    // FIX 2532: Check if result exists and contains a user
    if (result.length === 0 || !result[0] || !result[0].user) {
        throw new HTTPException(401, { message: 'Account not found' });
    }

    // Since we checked result.length, TypeScript knows result[0] exists
    const userData = result[0].user;

    // 5. Account Status Checks
    if (!userData.isActive) {
        throw new HTTPException(403, { message: 'Your account is deactivated' });
    }
    if (!userData.isVerified) {
        throw new HTTPException(403, { message: 'Please verify your email address' });
    }

    // 6. Aggregate permission slugs into a flat string array
    const slugs = result
        .map(r => r.permissionSlug)
        .filter((slug): slug is string => slug !== null); // Remove nulls and satisfy TS string[] type

    // 7. Store data in Hono Context for use in Controllers
    c.set('currentUser', userData);
    c.set('userPermissions', slugs);
    
    await next();
});