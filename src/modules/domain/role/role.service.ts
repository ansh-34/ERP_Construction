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

  async listRoles(
    domainId: string,
    query: PaginationQuery & {
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
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

    if (language) {
      role.name = RoleService.localizeName(role.name, language);
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
