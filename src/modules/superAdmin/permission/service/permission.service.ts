import { PermissionRepository } from '@repositories/index';
import { StatusEnum } from '@constants/index';
import { generateCode } from '@/utils/code';

export const PermissionService = {
  async addPermission(data: { name: string }) {
    let code = generateCode('PERMISSION');

    while (await PermissionRepository.findByCode(code)) {
      code = generateCode('PERMISSION');
    }

    return PermissionRepository.create(data.name, code);
  },

  async editPermission(
    permissionId: string,
    data: {
      name?: string;
      status?: StatusEnum;
    },
  ) {
    const existing = await PermissionRepository.findById(permissionId);

    if (!existing) {
      throw new Error('Permission not found');
    }

    return PermissionRepository.update(permissionId, {
      name: data.name ?? existing.name,
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
