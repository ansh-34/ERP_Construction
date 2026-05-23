import { ModulePermissionRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const ModulePermissionService = {
  async listModulePermissions(
    query: PaginationQuery & {
      searchKey?: string;
      moduleId?: string;
      permissionId?: string;
    },
    langCode: string,
  ) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, modulePermissions] =
      await ModulePermissionRepository.list(limit, offset, {
        filter: {
          status: 'ACTIVE',
          searchKey: query.searchKey || '',
          moduleId: query.moduleId,
          permissionId: query.permissionId,
        },
      });

    const updatedModulePermissions = modulePermissions.map((mp: any) => ({
      ...mp,
      module: {
        ...mp.module,
        name: mp.module.name[langCode] || mp.module.name.en || '',
      },
      permission: {
        ...mp.permission,
        name: mp.permission.name[langCode] || mp.permission.name.en || '',
      },
    }));

    return {
      modulePermissions: updatedModulePermissions,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },
};
