import { Messages } from '../../../constants/index.js';
import {
  ModuleRepository,
  PermissionRepository,
  RoleRepository,
  UserRepository,
} from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';
import prisma from '../../../infra/database/prisma/prisma.client.js';

export const RoleService = {
  localizeName(value: any, langCode: string) {
    if (!value || typeof value !== 'object') return '';
    return value[langCode] || value.en || '';
  },

  normalizeCode(value: string) {
    return value.toString().trim().toUpperCase().replace(/\s+/g, '_');
  },

  async createRole(
    domainId: string,
    data: { name: Record<string, string>; level?: number },
    langCode: string = 'en',
  ) {
    const incomingLanguageCodes: string[] = Object.keys(data.name || {});
    if (!incomingLanguageCodes.includes('en')) {
      throw new Error(Messages.ROLE.NAME_EN_REQUIRED);
    }

    const searchText = Object.values(data.name).join(' ').toLowerCase();
    const code = data.name.en.toString().trim().toLowerCase();

    const existing = await RoleRepository.findActiveByCodeAndDomain(
      code,
      domainId,
    );
    if (existing) {
      throw new Error(Messages.ROLE.CODE_ALREADY_EXISTS);
    }

    const record = await RoleRepository.create({
      name: data.name,
      code,
      searchText,
      level: data.level ?? 0,
      domainId,
    });

    return {
      ...record,
      name: RoleService.localizeName(record.name, langCode),
    };
  },

  async assignPermissions(
    domainId: string,
    roleId: string,
    data:
      | { moduleId: string; permissions: string[] }
      | { moduleId: string; permissions: string[] }[],
  ) {
    const items = Array.isArray(data) ? data : [data];

    if (items.length === 0) {
      throw new Error(Messages.ROLE.MODULE_ID_PERMISSIONS_REQUIRED);
    }

    for (const item of items) {
      const { moduleId, permissions } = item;
      if (!moduleId || !permissions || !Array.isArray(permissions)) {
        throw new Error(Messages.ROLE.MODULE_ID_PERMISSIONS_REQUIRED);
      }
    }

    const validPermissions = await PermissionRepository.listActiveCodes();
    const validCodes = validPermissions.map((p) => p.code);

    for (const item of items) {
      const { permissions } = item;
      const invalid = (permissions as string[]).filter(
        (p) => !validCodes.includes(p),
      );
      if (invalid.length) {
        throw new Error(
          `${Messages.ROLE.INVALID_PERMISSIONS_PREFIX}: ${invalid.join(', ')}`,
        );
      }
    }

    const role = await RoleRepository.findActiveByIdAndDomain(roleId, domainId);
    if (!role) {
      throw new Error(Messages.COMMON.FORBIDDEN);
    }

    for (const item of items) {
      const mod = await ModuleRepository.findActiveById(item.moduleId);
      if (!mod) {
        throw new Error(Messages.MODULE.INVALID_ID);
      }
    }

    const results = await prisma.$transaction(
      items.map((item) =>
        prisma.roleModulePermission.upsert({
          where: {
            roleId_moduleId_domainId: {
              roleId: role.id,
              moduleId: item.moduleId,
              domainId,
            },
          },
          update: { permissions: item.permissions },
          create: {
            roleId: role.id,
            moduleId: item.moduleId,
            permissions: item.permissions,
            domainId,
          },
        }),
      ),
    );

    return Array.isArray(data) ? results : results[0];
  },

  async listRoles(
    domainId: string,
    query: PaginationQuery & {
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
    },
    langCode?: string,
  ) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, roles] = await RoleRepository.listByDomain(
      domainId,
      limit,
      offset,
      {
        status: query.status,
        searchKey: query.searchKey,
      },
    );

    const localizedRoles = roles.map((role: any) => ({
      ...role,
      name: langCode
        ? RoleService.localizeName(role.name, langCode)
        : role.name,
      roleModulePermissions: (role.roleModulePermissions || []).map(
        (rmp: any) => ({
          ...rmp,
          module: rmp.module
            ? {
                ...rmp.module,
                name: langCode
                  ? RoleService.localizeName(rmp.module.name, langCode)
                  : rmp.module.name,
              }
            : rmp.module,
        }),
      ),
    }));

    return {
      roles: localizedRoles,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async getRoleById(
    domainId: string,
    id: string,
    language: string | null = null,
  ) {
    const role: any = await RoleRepository.findActiveByIdAndDomain(
      id,
      domainId,
    );
    if (!role) {
      throw new Error(Messages.ROLE.NOT_FOUND);
    }

    const langCode = language || 'en';
    role.name = RoleService.localizeName(role.name, langCode);

    if (role.roleModulePermissions) {
      role.roleModulePermissions = role.roleModulePermissions.map(
        (rmp: any) => ({
          ...rmp,
          module: rmp.module
            ? {
                ...rmp.module,
                name: RoleService.localizeName(rmp.module.name, langCode),
              }
            : rmp.module,
        }),
      );
    }

    return role;
  },

  async updateRole(
    domainId: string,
    id: string,
    data: {
      name?: Record<string, string>;
      code?: string;
      level?: number;
      status?: 'ACTIVE' | 'INACTIVE';
    },
    langCode: string = 'en',
  ) {
    const existing = await RoleRepository.findActiveByIdAndDomain(id, domainId);
    if (!existing) {
      throw new Error(Messages.ROLE.NOT_FOUND);
    }

    if (data.name) {
      const incomingLanguageCodes: string[] = Object.keys(data.name);
      if (!incomingLanguageCodes.includes('en')) {
        throw new Error(Messages.ROLE.NAME_EN_REQUIRED);
      }
    }

    let code: string | null = null;
    if (data.code) {
      code = RoleService.normalizeCode(data.code);
      if (code !== (existing as any).code) {
        const duplicate = await RoleRepository.findDuplicateCode(
          domainId,
          code,
          id,
        );
        if (duplicate) {
          throw new Error(Messages.ROLE.CODE_ALREADY_EXISTS);
        }
      }
    }

    const searchText = data.name
      ? Object.values(data.name).join(' ').toLowerCase()
      : null;

    const record = await RoleRepository.update(id, {
      ...data,
      ...(code ? { code } : {}),
      ...(searchText ? { searchText } : {}),
    });

    return {
      ...record,
      name: RoleService.localizeName(record.name, langCode),
    };
  },

  async deleteRole(domainId: string, id: string) {
    const existing = await RoleRepository.findActiveByIdAndDomain(id, domainId);
    if (!existing) {
      throw new Error(Messages.ROLE.NOT_FOUND);
    }
    return RoleRepository.softDelete(id);
  },

  async assignRole(
    domainId: string,
    roleId: string,
    data: { userIds: string[] },
  ) {
    const { userIds } = data;

    const [allAreValidUsers, role] = await Promise.all([
      UserRepository.validateUserIds(userIds, domainId),
      RoleRepository.findActiveByIdAndDomain(roleId, domainId),
    ]);

    if (!allAreValidUsers) {
      throw new Error(Messages.ROLE.INVALID_USER_IDS);
    }
    if (!role) {
      throw new Error(Messages.ROLE.NOT_FOUND);
    }

    const usersWithRoleCount = await UserRepository.countByRole(
      roleId,
      domainId,
    );

    return await Promise.all([
      UserRepository.assignRole(userIds, roleId),
      RoleRepository.update(roleId, {
        usersCount: usersWithRoleCount + userIds.length,
      }),
    ]);
  },
};
