import { PermissionRepository } from '@repositories/index';
import { StatusEnum } from '@constants/index';

export const PermissionService = {
  async addPermission(data: { name: string; code: string }) {
    const existing = await PermissionRepository.findByCode(data.code);

    if (existing) {
      throw new Error('Permission already exists');
    }

    return PermissionRepository.create(data.name, data.code);
  },

  async editPermission(
    permissionId: string,
    data: {
      name?: string;
      code?: string;
      status?: StatusEnum;
    },
  ) {
    const existing = await PermissionRepository.findById(permissionId);

    if (!existing) {
      throw new Error('Permission not found');
    }

    if (data.code && data.code !== existing.code) {
      const duplicate = await PermissionRepository.findDuplicateCode(
        data.code,
        permissionId,
      );

      if (duplicate) {
        throw new Error('A Permission with this code already exists');
      }
    }

    return PermissionRepository.update(permissionId, {
      name: data.name ?? existing.name,
      code: data.code ?? existing.code,
      status: (data.status ?? existing.status) as StatusEnum,
    });
  },

  async removePermission(permissionId: string) {
    const existing = await PermissionRepository.findById(permissionId);

    if (!existing) {
      throw new Error('Permission not found');
    }

    return PermissionRepository.softDelete(permissionId);
  },

  async listPermissions(query: any) {
    const whereFilter: any = {
      isDeleted: false,
    };

    if (query.searchKey) {
      whereFilter.OR = [
        {
          name: {
            contains: query.searchKey,
            mode: 'insensitive',
          },
        },
        {
          code: {
            contains: query.searchKey,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (query.status) {
      whereFilter.status = query.status;
    }

    const totalCount = await PermissionRepository.count(whereFilter);

    const permissions = await PermissionRepository.list(
      whereFilter,
      Number(query.limit) || 50,
      Number(query.offset) || 0,
    );

    return {
      permissions,
      totalCount,
    };
  },
};
