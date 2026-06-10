import type { IndustryEnum } from '../../../infra/database/prisma/generated/prisma/client/enums.js';
import { AdminIndustryRoleTemplateRepository } from '../../../repositories/index.js';
import {
  normalizePagination,
  type PaginationQuery,
} from '../../../utils/pagination.js';

type LocalizedName = Record<string, string>;

const localizeName = (name: unknown, langCode: string) => {
  if (!name || typeof name !== 'object') return '';
  const value = name as Record<string, string>;
  return value[langCode] || value.en || '';
};

const normalizeCode = (value: string) =>
  value.toString().trim().toLowerCase().replace(/\s+/g, '_');

const buildSearchText = (name: LocalizedName) =>
  Object.values(name).join(' ').toLowerCase();

const formatTemplate = (template: any, langCode: string) => ({
  ...template,
  name: localizeName(template.name, langCode),
});

export const IndustryRoleTemplateService = {
  async create(
    adminId: string,
    data: {
      name: LocalizedName;
      code?: string;
      level?: number;
      industry: IndustryEnum;
      status?: 'ACTIVE' | 'INACTIVE';
    },
    langCode: string = 'en',
  ) {
    const code = normalizeCode(data.code || data.name.en);
    const existing = await AdminIndustryRoleTemplateRepository.findDuplicate(
      adminId,
      data.industry,
      code,
    );

    if (existing) {
      throw new Error('duplicate code');
    }

    const template = await AdminIndustryRoleTemplateRepository.create({
      name: data.name,
      code,
      level: data.level ?? 4,
      industry: data.industry,
      searchText: buildSearchText(data.name),
      adminId,
      ...(data.status && { status: data.status }),
    });

    return formatTemplate(template, langCode);
  },

  async bulkCreate(
    adminId: string,
    data: {
      industry: IndustryEnum;
      roles: {
        name: LocalizedName;
        code?: string;
        level?: number;
        status?: 'ACTIVE' | 'INACTIVE';
      }[];
    },
    langCode: string = 'en',
  ) {
    const created = [];
    const skipped = [];
    const seenCodes = new Set<string>();

    for (const role of data.roles) {
      const code = normalizeCode(role.code || role.name.en);

      if (seenCodes.has(code)) {
        skipped.push({
          name: role.name,
          code,
          reason: 'duplicate in request',
        });
        continue;
      }

      seenCodes.add(code);

      const existing = await AdminIndustryRoleTemplateRepository.findDuplicate(
        adminId,
        data.industry,
        code,
      );

      if (existing) {
        skipped.push({
          name: role.name,
          code,
          reason: 'duplicate code',
        });
        continue;
      }

      const template = await AdminIndustryRoleTemplateRepository.create({
        name: role.name,
        code,
        level: role.level ?? 4,
        industry: data.industry,
        searchText: buildSearchText(role.name),
        adminId,
        ...(role.status && { status: role.status }),
      });

      created.push(formatTemplate(template, langCode));
    }

    return {
      created,
      skipped,
      inserted: created.length,
      skippedCount: skipped.length,
    };
  },

  async list(
    adminId: string,
    query: PaginationQuery & {
      searchKey?: string;
      industry?: IndustryEnum;
      status?: 'ACTIVE' | 'INACTIVE';
    },
    langCode: string = 'en',
  ) {
    const { offset, limit } = normalizePagination({
      offset: query.offset,
      limit: query.limit,
    });

    const [totalCount, templates] =
      await AdminIndustryRoleTemplateRepository.listByAdmin(
        adminId,
        limit,
        offset,
        {
          searchKey: query.searchKey,
          industry: query.industry,
          status: query.status,
        },
      );

    return {
      templates: templates.map((template) =>
        formatTemplate(template, langCode),
      ),
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async getById(adminId: string, id: string, langCode: string = 'en') {
    const template = await AdminIndustryRoleTemplateRepository.findByIdAndAdmin(
      id,
      adminId,
    );

    if (!template) {
      throw new Error('not found');
    }

    return formatTemplate(template, langCode);
  },

  async update(
    adminId: string,
    id: string,
    data: {
      name?: LocalizedName;
      code?: string;
      level?: number;
      industry?: IndustryEnum;
      status?: 'ACTIVE' | 'INACTIVE';
    },
    langCode: string = 'en',
  ) {
    const existing = await AdminIndustryRoleTemplateRepository.findByIdAndAdmin(
      id,
      adminId,
    );

    if (!existing) {
      throw new Error('not found');
    }

    const industry = data.industry || existing.industry;
    const code =
      data.code !== undefined
        ? normalizeCode(data.code)
        : data.name !== undefined
          ? normalizeCode(data.name.en)
          : existing.code;

    const duplicate = await AdminIndustryRoleTemplateRepository.findDuplicate(
      adminId,
      industry,
      code,
      id,
    );

    if (duplicate) {
      throw new Error('duplicate code');
    }

    const updated = await AdminIndustryRoleTemplateRepository.update(id, {
      ...(data.name !== undefined && {
        name: data.name,
        searchText: buildSearchText(data.name),
      }),
      code,
      ...(data.level !== undefined && { level: data.level }),
      ...(data.industry !== undefined && { industry: data.industry }),
      ...(data.status !== undefined && { status: data.status }),
    });

    return formatTemplate(updated, langCode);
  },

  async delete(adminId: string, id: string) {
    const existing = await AdminIndustryRoleTemplateRepository.findByIdAndAdmin(
      id,
      adminId,
    );

    if (!existing) {
      throw new Error('not found');
    }

    await AdminIndustryRoleTemplateRepository.softDelete(id);
  },
};
