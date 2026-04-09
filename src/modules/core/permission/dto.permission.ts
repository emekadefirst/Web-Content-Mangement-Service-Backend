import { z } from '@hono/zod-openapi';
import { PermissionQuerySchema, PermissionGroupQuerySchema, PaginatedPermissionResponseSchema, PaginatedPermGroupResponseSchema, createPermissionSchema, createPermissionGroupSchema, updatePermissionSchema, updatePermissionGroupSchema  } from './schemas.permisison';

// Exporting Schemas for use in Controllers and Services

export type PermissionQueryDTO = z.infer<typeof PermissionQuerySchema>;
export type PermissionGroupQueryDTO = z.infer<typeof PermissionGroupQuerySchema>;

export type PaginatedPermissionResponseDTO = z.infer<typeof PaginatedPermissionResponseSchema>;   

export type PaginatedPermissionGroupResponseDTO = z.infer<typeof PaginatedPermGroupResponseSchema>;

export type CreatePermissionDTO = z.infer<typeof createPermissionSchema>;
export type CreatePermissionGroupDTO = z.infer<typeof createPermissionGroupSchema>;

export type UpdatePermissionDTO = z.infer<typeof updatePermissionSchema>;
export type UpdatePermissionGroupDTO = z.infer<typeof updatePermissionGroupSchema>;

