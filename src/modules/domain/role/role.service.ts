import { Messages } from '../../../constants/index.js';
import {
  ModuleRepository,
  PermissionRepository,
  RoleRepository,
  UserRepository,
  RoleModulePermissionRepository,
  adminUserTypeRepository,
  domainUserTypeRepository,
} from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { transaction } from '@/infra/database/prisma/transaction.js';

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
    adminId: string,
    data: {
      name: Record<string, string>;
      code?: string;
      userTypeCode?: string;
      domainUserTypeCode?: string;
      level?: number;
    },
    langCode: string = 'en',
  ) {
    const incomingLanguageCodes: string[] = Object.keys(data.name || {});
    if (!incomingLanguageCodes.includes('en')) {
      throw new Error(Messages.ROLE.NAME_EN_REQUIRED);
    }

    const searchText = Object.values(data.name).join(' ').toLowerCase();
    const code = (data.code ?? data.name.en).toString().trim().toLowerCase();
    const userTypeCode = data.userTypeCode
      ? data.userTypeCode.toString().trim().toLowerCase()
      : null;
    const userType = userTypeCode
      ? await adminUserTypeRepository.findActiveByCodeAndAdmin(
          userTypeCode,
          adminId,
        )
      : null;

    if (userTypeCode && !userType) {
      throw new Error('invalid userTypeCode');
    }

    const domainUserTypeCode = data.domainUserTypeCode
      ? data.domainUserTypeCode.toString().trim().toUpperCase()
      : null;

    const domainUserType = domainUserTypeCode
      ? await domainUserTypeRepository.findByCodeAndDomain(
          domainUserTypeCode,
          domainId,
        )
      : null;

    if (domainUserTypeCode && !domainUserType) {
      throw new Error('invalid domainUserTypeCode');
    }

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
      adminId,
      userTypeId: userType?.id ?? null,
      userTypeCode: userType?.code ?? userTypeCode,
      domainUserTypeCode: domainUserType?.userType?.code ?? null,
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

    if (!items.length) {
      throw new Error(Messages.ROLE.MODULE_ID_PERMISSIONS_REQUIRED);
    }

    for (const { moduleId, permissions } of items) {
      if (!moduleId || !Array.isArray(permissions)) {
        throw new Error(Messages.ROLE.MODULE_ID_PERMISSIONS_REQUIRED);
      }
    }

    const [role, validPermissions] = await Promise.all([
      RoleRepository.findActiveByIdAndDomain(roleId, domainId),
      PermissionRepository.listActiveCodes(),
    ]);

    if (!role) {
      throw new Error(Messages.COMMON.FORBIDDEN);
    }

    const validPermissionSet = new Set(validPermissions.map((p) => p.code));

    for (const { permissions } of items) {
      if (!permissions.length) continue;

      const invalidPermissions = permissions.filter(
        (permission) => !validPermissionSet.has(permission),
      );

      if (invalidPermissions.length) {
        throw new Error(
          `${Messages.ROLE.INVALID_PERMISSIONS_PREFIX}: ${invalidPermissions.join(
            ', ',
          )}`,
        );
      }
    }

    const moduleIds = [...new Set(items.map((item) => item.moduleId))];
    const modules = await ModuleRepository.findActiveByIds(moduleIds);
    const moduleIdSet = new Set(modules.map((module) => module.id));
    const invalidModuleIds = moduleIds.filter((id) => !moduleIdSet.has(id));

    if (invalidModuleIds.length) {
      throw new Error(Messages.MODULE.INVALID_ID);
    }

    const modulePermissionMap = new Map<string, Set<string>>();

    for (const item of items) {
      modulePermissionMap.set(item.moduleId, new Set(item.permissions));
    }

    const normalizedItems = [...modulePermissionMap.entries()].map(
      ([moduleId, permissions]) => ({
        moduleId,
        permissions: [...permissions],
      }),
    );

    return transaction(async (tx) => {
      const results = [];

      for (const item of normalizedItems) {
        if (item.permissions.length === 0) {
          await RoleModulePermissionRepository.deleteMany(
            {
              roleId: role.id,
              domainId,
              moduleId: item.moduleId,
            },
            tx,
          );

          continue;
        }

        const result = await RoleModulePermissionRepository.upsert(
          {
            roleId: role.id,
            moduleId: item.moduleId,
            permissions: item.permissions,
            domainId,
          },
          tx,
        );

        results.push(result);
      }

      const modulePermissionsCount = await RoleModulePermissionRepository.count(
        {
          roleId: role.id,
          domainId,
        },
        tx,
      );

      await RoleRepository.update(
        role.id,
        {
          modulePermissionCount: modulePermissionsCount,
        },
        tx,
      );

      return Array.isArray(data) ? results : (results[0] ?? null);
    });
  },

  async listRoles(
    domainId: string,
    query: PaginationQuery & {
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      userTypeCode?: string;
      userTypeId?: string;
      domainUserTypeCode?: string;
      standalone?: boolean;
    },
    langCode: string,
  ) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, roles] = await RoleRepository.listByDomain(
      domainId,
      limit,
      offset,
      {
        status: query.status,
        searchKey: query.searchKey,
        userTypeCode: query.userTypeCode,
        userTypeId: query.userTypeId,
        domainUserTypeCode: query.domainUserTypeCode,
        standalone: query.standalone,
      },
    );

    const localizedRoles = roles.map((role: any) => ({
      ...role,
      name: RoleService.localizeName(role.name, langCode),
      roleModulePermissions: (role.roleModulePermissions || []).map(
        (rmp: any) => ({
          ...rmp,
          module: rmp.module
            ? {
                ...rmp.module,
                name: RoleService.localizeName(rmp.module.name, langCode),
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
    adminId: string,
    id: string,
    data: {
      name?: Record<string, string>;
      code?: string;
      userTypeCode?: string | null;
      domainUserTypeCode?: string | null;
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
    const userTypeCode =
      data.userTypeCode === undefined || data.userTypeCode === null
        ? data.userTypeCode
        : data.userTypeCode.toString().trim().toLowerCase();
    const userType =
      typeof userTypeCode === 'string'
        ? await adminUserTypeRepository.findActiveByCodeAndAdmin(
            userTypeCode,
            adminId,
          )
        : null;

    if (typeof userTypeCode === 'string' && !userType) {
      throw new Error('invalid userTypeCode');
    }

    const incomingDomainUserTypeCode =
      typeof data.domainUserTypeCode === 'string'
        ? data.domainUserTypeCode.toString().trim().toUpperCase()
        : data.domainUserTypeCode;

    const domainUserType =
      typeof incomingDomainUserTypeCode === 'string'
        ? await domainUserTypeRepository.findByCodeAndDomain(
            incomingDomainUserTypeCode,
            domainId,
          )
        : null;

    if (typeof incomingDomainUserTypeCode === 'string' && !domainUserType) {
      throw new Error('invalid domainUserTypeCode');
    }

    const record = await RoleRepository.update(id, {
      ...data,
      ...(code ? { code } : {}),
      ...(searchText ? { searchText } : {}),
      ...(data.userTypeCode !== undefined
        ? {
            userTypeId: userType?.id ?? null,
            userTypeCode: userType?.code ?? null,
          }
        : {}),
      ...(data.domainUserTypeCode !== undefined
        ? { domainUserTypeCode: domainUserType?.userType?.code ?? null }
        : {}),
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
