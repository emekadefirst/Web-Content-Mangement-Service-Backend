import { pgTable, pgEnum, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { ModuleEnum } from "../../../enums/base.enum";
import { relations } from 'drizzle-orm';

export const Action = pgEnum('actions', ['create', 'read', 'update', 'delete'])
export const Module = pgEnum('module', ModuleEnum as unknown as [string, ...string[]])

export const Permission = pgTable('permissions', {
    id: uuid("id").primaryKey().defaultRandom(),
    module: varchar("module", { length: 256 }).notNull(),
    action: Action("action").notNull(),
    slug: varchar("slug", { length: 256 }).unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})


export const PermissionGroup = pgTable('permission_groups', {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 256 }).notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
    return {
        nameIndex: index("idx_permission_groups_name").on(table.name)
    };
});

export const PermissionGroupPermissions = pgTable('permission_group_permissions', {
    id: uuid("id").primaryKey().defaultRandom(),
    permissionGroupId: uuid("permission_group_id").notNull().references(() => PermissionGroup.id, { onDelete: 'cascade' }),
    permissionId: uuid("permission_id").notNull().references(() => Permission.id, { onDelete: 'cascade' }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const PermissionGroupRelations = relations(PermissionGroup, ({ many }) => ({
    permissionGroupPermissions: many(PermissionGroupPermissions),
}));

export const PermissionGroupPermissionsRelations = relations(PermissionGroupPermissions, ({ one }) => ({
    group: one(PermissionGroup, {
        fields: [PermissionGroupPermissions.permissionGroupId],
        references: [PermissionGroup.id],
    }),
    permission: one(Permission, {
        fields: [PermissionGroupPermissions.permissionId],
        references: [Permission.id],
    }),
}));

export const PermissionRelations = relations(Permission, ({ many }) => ({
    permissionGroupPermissions: many(PermissionGroupPermissions),
}));