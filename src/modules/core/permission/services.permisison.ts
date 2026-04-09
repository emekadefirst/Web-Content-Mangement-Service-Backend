import { PermissionRepo, PermissionGroupRepo } from "./repositories.permission";
import type {
    PermissionQueryDTO,
    CreatePermissionDTO,
    PermissionGroupQueryDTO,
    CreatePermissionGroupDTO,
    UpdatePermissionGroupDTO,
    UpdatePermissionDTO
} from "./dto.permission";

export class PermissionService {
    private repo: PermissionRepo;

    constructor() {
        this.repo = new PermissionRepo();
    }

    async createPermission(data: CreatePermissionDTO) {
        // 1. Force the slug format to "module:action"
        // We use lowercase to ensure consistency in the database
        const generatedSlug = `${data.module.toLowerCase()}:${data.action.toLowerCase()}`;

        // 2. Spread the original data and override/add the slug
        const permissionData = {
            ...data,
            slug: generatedSlug
        };

        return await this.repo.create(permissionData);
    }

    async getAllPermissions(params: PermissionQueryDTO) {
        return await this.repo.fetch(params);
    }

    async getPermissionById(id: string) {
        return await this.repo.findById(id);
    }

    async updatePermission(id: string, data: UpdatePermissionDTO) {
        return await this.repo.update(id, data);
    }

    async deletePermission(id: string) {
        return await this.repo.delete(id);
    }
}

export class PermissionGroupService {
    private repo: PermissionGroupRepo;

    constructor() {
        this.repo = new PermissionGroupRepo();
    }

    /**
     * Creates a group and optionally links permissions
     */
    async createGroup(data: CreatePermissionGroupDTO & { permissionIds?: string[] }) {
        return await this.repo.create(data);
    }

    /**
     * Fetch groups with pagination and filters
     */
    async getAllGroups(params: PermissionGroupQueryDTO) {
        return await this.repo.fetch(params);
    }

    /**
     * Get a specific group and its associated permissions
     */
    async getGroupById(id: string) {
        const group = await this.repo.findById(id);

        // If your repo returns the raw relational structure, 
        // you can flatten the permissions array here for the UI
        return group;
    }

    /**
     * Update group name or sync permission list
     */
    async updateGroup(id: string, data: UpdatePermissionGroupDTO & { permissionIds?: string[] }) {
        return await this.repo.update(id, data);
    }

    /**
     * Remove a group (cascade delete handles join table)
     */
    async deleteGroup(id: string) {
        return await this.repo.delete(id);
    }
}