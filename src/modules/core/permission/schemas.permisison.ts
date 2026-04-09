import { z } from '@hono/zod-openapi';
import { Permission, PermissionGroup } from './models.permission';
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Query Schemas

export const PermissionQuerySchema = z.object({
    id: z.string().uuid().optional(),
    module: z.string().optional(),
    action: z.enum(['create', 'read', 'update', 'delete']).optional(),
    search: z.string().optional(),
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(10),
})


export const PermissionGroupQuerySchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().optional(),
    search: z.string().optional(),
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(10),
})

// Object schemas

export const PermissionSchema = z.object({
    id: z.string().uuid(),
    module: z.string(),
    action: z.enum(['create', 'read', 'update', 'delete']),
    slug: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

const NestedPermissionObject = z.object({
    id: z.string().uuid(),
    slug: z.string(),
})


export const PermissionGroupSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    permissions: z.array(NestedPermissionObject),
    createdAt: z.date(),
    updatedAt: z.date(),
})


// Paginated Response Schemas

export const PaginatedPermissionResponseSchema = z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    data: z.array(PermissionSchema),
})

export const PaginatedPermGroupResponseSchema = z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    data: z.array(PermissionGroupSchema),
})

// Create Schemas
export const createPermissionSchema = createInsertSchema(Permission).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
})


export const createPermissionGroupSchema = createInsertSchema(PermissionGroup).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
})

// Update Schemas

export const updatePermissionSchema = createInsertSchema(Permission).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial()

export const updatePermissionGroupSchema = createInsertSchema(PermissionGroup).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial()




