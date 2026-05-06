import { Messages } from '../../../constants/index.js';
import {
  ModulePermissionRepository,
  ModuleRepository,
  PermissionRepository,
} from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { SetModulePermissionsData } from './modulePermission.validator.js';

export const ModulePermissionService = {
  async createModulePermissions(data: SetModulePermissionsData) {
    const { moduleId, permissionIds } = data;

    if (!moduleId || !permissionIds || !Array.isArray(permissionIds)) {
      throw new Error(Messages.MODULE_PERMISSION.REQUIRED);
    }

    const [mod, validPermissions] = await Promise.all([
      ModuleRepository.findActiveById(moduleId),
      PermissionRepository.validatePermissionIds(permissionIds),
    ]);

    if (!mod) {
      throw new Error(Messages.MODULE.NOT_FOUND);
    }
    if (!validPermissions) {
      throw new Error(Messages.MODULE_PERMISSION.INVALID_PERMISSIONS);
    }

    return ModulePermissionRepository.bulkCreate(
      permissionIds.map((permissionId) => ({
        moduleId,
        permissionId,
      })),
    );
  },

  async listModulePermissions(query: PaginationQuery) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, modulePermissions] =
      await ModulePermissionRepository.list(limit, offset);

    return {
      modulePermissions,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async deleteModulePermissions(id: string) {
    const record = await ModulePermissionRepository.findById(id);
    if (!record) {
      throw new Error(Messages.MODULE_PERMISSION.RECORD_NOT_FOUND);
    }

    await ModulePermissionRepository.delete(id);
  },
};
