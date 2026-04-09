import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'
import { db } from '../core/db.core';
import { User } from '../core/models.core';
import { HTTPException } from 'hono/http-exception';
import { JwtService } from '../modules/core/auth/jwt.auth';
import { eq } from 'drizzle-orm';

// Define public paths in a Set for high-performance lookup
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
    // ... (Keep your public path logic and token extraction the same) ...

    const payload = await JwtService.verifyToken(token, 'access');
    if (!payload?.sub) throw new HTTPException(401, { message: 'Invalid token' });

    // JOIN User and PermissionGroup in one query
    const result = await db
        .select({
            user: User,
            permissions: PermissonGroup.permissions
        })
        .from(User)
        .leftJoin(PermissonGroup, eq(User.permissionGroupId, PermissonGroup.id))
        .where(eq(User.id, payload.sub))
        .limit(1);

    const data = result[0];

    if (!data || !data.user) {
        throw new HTTPException(401, { message: 'Account not Found' });
    } 
    
    // Status checks
    if (!data.user.isActive) throw new HTTPException(403, { message: 'Inactive' });
    if (!data.user.isVerified) throw new HTTPException(403, { message: 'Not Verified' });

    // Store both in context
    c.set('currentUser', data.user);
    c.set('userPermissions', data.permissions as string[] || []);
    
    await next();
});