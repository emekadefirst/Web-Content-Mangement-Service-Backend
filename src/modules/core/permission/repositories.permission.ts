import type {
    PermissionQueryDTO,
    PermissionGroupQueryDTO,
    CreatePermissionDTO,
    CreatePermissionGroupDTO,
    UpdatePermissionDTO,
    UpdatePermissionGroupDTO
} from "./dto.permission";
import { db } from "../../../core/db.core";
import { Permission, PermissionGroup, PermissionGroupPermissions } from "./models.permission";
import { ilike, eq, desc, or, and, count } from "drizzle-orm";


export class PermissionRepo {
    async create(data: CreatePermissionDTO) {
        try {
            const [permission] = await db
                .insert(Permission)
                .values(data) // Remove 'as' cast if DTO matches schema
                .returning();

            if (!permission) throw new Error("Insert failed");
            return permission;
        } catch (error) {
            console.error("Create Permission Error:", error);
            throw new Error("Could not create permission. Ensure slug is unique.");
        }
    }

    async fetch(params: PermissionQueryDTO) {
        const { id, action, module, search, page = 1, pageSize = 10 } = params;
        const offset = (page - 1) * pageSize;

        const filters = [];
        if (id) filters.push(eq(Permission.id, id));
        if (action) filters.push(eq(Permission.action, action));
        if (module !== undefined) filters.push(eq(Permission.module, module));
        if (search) {
            filters.push(or(
                ilike(Permission.action, `%${search}%`),
                ilike(Permission.module, `%${search}%`),
                ilike(Permission.slug, `%${search}%`)
            ));
        }



        // Use 'undefined' if no filters exist so Drizzle ignores the where()
        const whereClause = filters.length > 0 ? and(...filters) : undefined;

        try {
            const [data, totalCount] = await Promise.all([
                db.select().from(Permission).where(whereClause).limit(pageSize).offset(offset),
                db.select({ count: count() }).from(Permission).where(whereClause)
            ]);

            return {
                page,
                pageSize,
                total: Number(totalCount[0]?.count || 0),
                data
            };
        } catch (error) {
            console.error("Fetch Error:", error);
            throw new Error("Failed to fetch permissions");
        }
    }


    async findById(id: string) {
        const [permission] = await db
            .select()
            .from(Permission)
            .where(eq(Permission.id, id));

        if (!permission) throw new Error("Permission permission not found");
        return permission;
    }


    async update(id: string, data: UpdatePermissionDTO) {
        try {
            const [permission] = await db
                .update(Permission)
                .set(data)
                .where(eq(Permission.id, id))
                .returning();

            if (!permission) throw new Error("Permission not found");
            return permission;
        } catch (error) {
            console.error("Update Error:", error);
            throw new Error("Update failed");
        }
    }

    async delete(id: string) {
        try {
            // Efficiency: Delete and return in one go
            const [deleted] = await db
                .delete(Permission)
                .where(eq(Permission.id, id))
                .returning();

            if (!deleted) {
                throw new Error("Permission not found or already deleted");
            }

            return { message: "Permission deleted successfully" };
        } catch (error) {
            console.error("Delete Error:", error);
            throw error; 
        }
    }
}


export class PermissionGroupRepo {
    
    async create(data: CreatePermissionGroupDTO & { permissionIds?: string[] }) {
        return await db.transaction(async (tx) => {
            // 1. Create the Group
            const [group] = await tx
                .insert(PermissionGroup)
                .values({ name: data.name })
                .returning();

            if (!group) throw new Error("Failed to create permission group");

            // 2. If permissions are provided, link them in the join table
            if (data.permissionIds && data.permissionIds.length > 0) {
                const relations = data.permissionIds.map((pId) => ({
                    permissionGroupId: group.id,
                    permissionId: pId,
                }));
                await tx.insert(PermissionGroupPermissions).values(relations);
            }

            return group;
        });
    }

    async fetch(params: PermissionGroupQueryDTO) {
        const { id, name, search, page = 1, pageSize = 10 } = params;
        const offset = (page - 1) * pageSize;

        const filters = [];
        if (id) filters.push(eq(PermissionGroup.id, id));
        if (name) filters.push(eq(PermissionGroup.name, name));
        if (search) {
            filters.push(ilike(PermissionGroup.name, `%${search}%`));
        }

        const whereClause = filters.length > 0 ? and(...filters) : undefined;

        try {
            const [data, totalCount] = await Promise.all([
                db.select().from(PermissionGroup).where(whereClause).limit(pageSize).offset(offset),
                db.select({ count: count() }).from(PermissionGroup).where(whereClause)
            ]);

            return {
                page,
                pageSize,
                total: Number(totalCount[0]?.count || 0),
                data
            };
        } catch (error) {
            console.error("Fetch Groups Error:", error);
            throw new Error("Unable to fetch permission groups");
        }
    }

    async findById(id: string) {
        const [group] = await db
            .select()
            .from(PermissionGroup)
            .where(eq(PermissionGroup.id, id));

        if (!group) throw new Error("Permission group not found");
        return group;
    }

    async update(id: string, data: UpdatePermissionGroupDTO & { permissionIds?: string[] }) {
        return await db.transaction(async (tx) => {
            // 1. Update basic info
            const [updatedGroup] = await tx
                .update(PermissionGroup)
                .set({ name: data.name, updatedAt: new Date() })
                .where(eq(PermissionGroup.id, id))
                .returning();

            if (!updatedGroup) throw new Error("Group not found");

            // 2. If permissionIds are provided, sync the relations (Delete old, Insert new)
            if (data.permissionIds) {
                await tx
                    .delete(PermissionGroupPermissions)
                    .where(eq(PermissionGroupPermissions.permissionGroupId, id));

                if (data.permissionIds.length > 0) {
                    const relations = data.permissionIds.map((pId) => ({
                        permissionGroupId: id,
                        permissionId: pId,
                    }));
                    await tx.insert(PermissionGroupPermissions).values(relations);
                }
            }

            return updatedGroup;
        });
    }

    async delete(id: string) {
        // Because of 'cascade' on your schema, deleting the group 
        // will automatically delete entries in PermissionGroupPermissions
        const [deleted] = await db
            .delete(PermissionGroup)
            .where(eq(PermissionGroup.id, id))
            .returning();

        if (!deleted) throw new Error("Group not found");

        return { message: "Permission group and its associations deleted successfully" };
    }
}