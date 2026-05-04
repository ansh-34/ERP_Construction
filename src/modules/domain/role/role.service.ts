import { Messages } from '../../../constants/index.js';
import {
  ModuleRepository,
  PermissionRepository,
  RoleModulePermissionRepository,
  RoleRepository,
  UserRepository,
} from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const RoleService = {
  async createRole(
    domainId: string,
    data: { name: string; code: string; level?: number },
  ) {
    const { name: rawName, code: rawCode, level } = data;

    if (!rawName || !rawCode) {
      throw new Error(Messages.ROLE.NAME_CODE_REQUIRED);
    }

    const name = rawName.trim().toLowerCase();
    const code = rawCode.trim().toLowerCase();

    if (!name || !code) {
      throw new Error(Messages.ROLE.NAME_CODE_REQUIRED);
    }

    const existing = await RoleRepository.findActiveByCodeAndDomain(
      code,
      domainId,
    );

    if (existing) {
      throw new Error(Messages.ROLE.CODE_ALREADY_EXISTS);
    }

    return RoleRepository.create({
      name,
      code,
      level: level ?? 0,
      domainId,
    });
  },

  async assignPermissions(
    domainId: string,
    roleId: string,
    data: { moduleId: string; permissions: string[] },
  ) {
    const { moduleId, permissions } = data;

    if (!moduleId || !permissions || !Array.isArray(permissions)) {
      throw new Error(Messages.ROLE.MODULE_ID_PERMISSIONS_REQUIRED);
    }

    const validPermissions = await PermissionRepository.listActiveCodes();
    const validCodes = validPermissions.map((p) => p.code);
    const invalid = (permissions as string[]).filter(
      (p) => !validCodes.includes(p),
    );

    if (invalid.length) {
      throw new Error(
        `${Messages.ROLE.INVALID_PERMISSIONS_PREFIX}: ${invalid.join(', ')}`,
      );
    }

    const role = await RoleRepository.findActiveByIdAndDomain(roleId, domainId);

    if (!role) {
      throw new Error(Messages.COMMON.FORBIDDEN);
    }

    const mod = await ModuleRepository.findActiveById(moduleId);

    if (!mod) {
      throw new Error(Messages.MODULE.INVALID_ID);
    }

    return RoleModulePermissionRepository.upsert({
      roleId: role.id,
      moduleId: mod.id,
      permissions,
      domainId,
    });
  },

  async listRoles(domainId: string, query: PaginationQuery) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, roles] = await RoleRepository.listByDomain(
      domainId,
      limit,
      offset,
    );

    return {
      roles,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async assignRole(
    domainId: string,
    targetUserId: string,
    data: { roleId: string },
  ) {
    const { roleId } = data;

    if (!roleId) {
      throw new Error(Messages.ROLE.ROLE_ID_REQUIRED);
    }

    const targetUser = await UserRepository.findActiveByIdAndDomain(
      targetUserId,
      domainId,
    );

    if (!targetUser) {
      throw new Error(Messages.COMMON.FORBIDDEN);
    }

    const role = await RoleRepository.findActiveByIdAndDomain(roleId, domainId);

    if (!role) {
      throw new Error(Messages.COMMON.FORBIDDEN);
    }

    return UserRepository.assignRole(targetUserId, roleId);
  },
};
