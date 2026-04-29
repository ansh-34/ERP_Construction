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
    const { name, code } = data;

    if (!name || !code) {
      throw new Error(Messages.PERMISSION.NAME_CODE_REQUIRED);
    }

    const existing = await PermissionRepository.findActiveByCode(code);

    if (existing) {
      throw new Error(Messages.PERMISSION.CODE_ALREADY_EXISTS);
    }

    return PermissionRepository.create({ name, code });
  },

  async listPermissions(query: PaginationQuery) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, permissions] = await PermissionRepository.listActive(
      limit,
      offset,
    );

    return {
      permissions,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async updatePermission(id: string, data: UpdatePermissionData) {
    const { name, code, status } = data;

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
      ...(name !== undefined && { name }),
      ...(code !== undefined && { code }),
      ...(status !== undefined && { status }),
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
