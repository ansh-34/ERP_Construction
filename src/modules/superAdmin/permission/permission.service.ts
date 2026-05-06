import { Messages } from '../../../constants/index.js';
import { PermissionRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';
import {
  CreatePermissionData,
  UpdatePermissionData,
} from './permission.validator.js';

export const PermissionService = {
  async createPermission(data: CreatePermissionData) {
    const { name } = data;

    const incomingLanguageCodes: string[] = Object.keys(name);
    if (!incomingLanguageCodes.includes('en')) {
      throw new Error(Messages.MODULE.NAME_EN_CODE_REQUIRED);
    }

    const code = name?.en?.toString().toUpperCase().replace(/\s+/g, '_');
    const existing = await PermissionRepository.findActiveByCode(code);

    if (existing) {
      throw new Error(Messages.PERMISSION.CODE_ALREADY_EXISTS);
    }

    const searchText = Object.values(name).join(' ').toLowerCase();

    return PermissionRepository.create({ name, code, searchText });
  },

  async listPermissions(
    query: PaginationQuery & { searchKey?: string },
    langCode: string,
  ) {
    const { offset, limit } = normalizePagination({
      limit: query.limit,
      offset: query.offset,
    });
    const { searchKey } = query;

    const [totalCount, permissions = []] =
      await PermissionRepository.listActive(limit, offset, {
        filter: searchKey ? { searchKey } : undefined,
      });

    const normalizedPermissions = permissions.map((perm: any) => ({
      ...perm,
      name: perm.name[langCode] || perm.name.en || '',
    }));

    return {
      permissions: normalizedPermissions,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async getPermission(id: string, langCode: string | null) {
    const permission: any = await PermissionRepository.findActiveById(id);
    if (!permission) {
      throw new Error(Messages.PERMISSION.NOT_FOUND);
    }

    if (langCode) {
      permission.name = permission.name[langCode] || permission.name.en || '';
    }

    return permission;
  },

  async updatePermission(id: string, data: UpdatePermissionData) {
    const { name, status } = data;
    let code = null;

    if (name) {
      const incomingLanguageCodes: string[] = Object.keys(name);
      if (!incomingLanguageCodes.includes('en')) {
        throw new Error(Messages.MODULE.NAME_EN_CODE_REQUIRED);
      }
      code = name?.en?.toString().toUpperCase().replace(/\s+/g, '_');
    }

    const permission = await PermissionRepository.findActiveById(id);

    if (!permission) {
      throw new Error(Messages.PERMISSION.NOT_FOUND);
    }

    if (code && code !== permission.code) {
      const duplicate = await PermissionRepository.findDuplicateCode(code, id);
      if (duplicate) {
        throw new Error(Messages.PERMISSION.CODE_ALREADY_EXISTS);
      }
    }

    return PermissionRepository.update(id, {
      ...(name && { name }),
      ...(code && { code }),
      ...(status && { status }),
    });
  },

  async deletePermission(id: string) {
    const permission = await PermissionRepository.findActiveById(id);

    if (!permission) {
      throw new Error(Messages.PERMISSION.NOT_FOUND);
    }

    await PermissionRepository.softDelete(id);
  },
};
