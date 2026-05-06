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
  async setModulePermissions(data: SetModulePermissionsData) {
    const { moduleId, permissions } = data;

    if (!moduleId || !permissions || !Array.isArray(permissions)) {
      throw new Error(Messages.MODULE_PERMISSION.REQUIRED);
    }

    const mod = await ModuleRepository.findActiveById(moduleId);

    if (!mod) {
      throw new Error(Messages.MODULE.NOT_FOUND);
    }

    const validPermissions = await PermissionRepository.listActiveCodes();
    const validCodes = validPermissions.map((p) => p.code);
    const invalid = (permissions as string[]).filter(
      (p) => !validCodes.includes(p),
    );

    if (invalid.length) {
      throw new Error(
        `${Messages.MODULE_PERMISSION.INVALID_CODES_PREFIX}: ${invalid.join(
          ', ',
        )}`,
      );
    }

    return ModulePermissionRepository.set(moduleId, permissions);
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
