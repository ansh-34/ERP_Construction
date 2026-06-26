import {
  adminUserTypeRepository,
  systemUserTypeRepository,
} from '@repositories/index';
import {
  normalizePagination,
  type PaginationQuery,
} from '../../../utils/pagination.js';
import { normalizePrismaError } from '../../../utils/prismaError.js';

type LocalizedText = Record<string, string>;

const localizeText = (value: unknown, langCode: string) => {
  if (!value || typeof value !== 'object') return '';
  const record = value as Record<string, string>;
  return record[langCode] || record.en || '';
};

const buildSearchText = (data: {
  name: LocalizedText;
  code: string;
  description?: LocalizedText | null;
}) =>
  [
    data.code,
    ...Object.values(data.name),
    ...(data.description ? Object.values(data.description) : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const formatUserType = (userType: any, langCode: string) => ({
  ...userType,
  name: localizeText(userType.name, langCode),
  description: userType.description
    ? localizeText(userType.description, langCode)
    : null,
});

export const AdminUserTypeService = {
  async select(
    adminId: string,
    data: { systemUserTypeIds: string[] },
    langCode: string = 'en',
  ) {
    try {
      const requestedIds = [...new Set(data.systemUserTypeIds)];
      const systemUserTypes =
        await systemUserTypeRepository.findActiveByIds(requestedIds);
      const systemUserTypesById = new Map(
        systemUserTypes.map((userType) => [userType.id, userType]),
      );
      const existingUserTypes =
        await adminUserTypeRepository.findActiveByCodesAndAdmin(
          systemUserTypes.map((userType) => userType.code),
          adminId,
        );
      const existingCodes = new Set(
        existingUserTypes.map((userType) => userType.code),
      );

      const created = [];
      const skipped: {
        systemUserTypeId: string;
        code?: string;
        reason: string;
      }[] = [];

      for (const systemUserTypeId of requestedIds) {
        const systemUserType = systemUserTypesById.get(systemUserTypeId);

        if (!systemUserType) {
          skipped.push({
            systemUserTypeId,
            reason: 'invalid system user type',
          });
          continue;
        }

        if (existingCodes.has(systemUserType.code)) {
          skipped.push({
            systemUserTypeId,
            code: systemUserType.code,
            reason: 'already selected',
          });
          continue;
        }

        const name = systemUserType.name as LocalizedText;
        const description = systemUserType.description as LocalizedText | null;
        const createdUserType = await adminUserTypeRepository.create({
          name,
          code: systemUserType.code,
          description: description ?? undefined,
          searchText: buildSearchText({
            name,
            code: systemUserType.code,
            description,
          }),
          adminId,
          status: 'ACTIVE',
        });

        existingCodes.add(systemUserType.code);
        created.push(formatUserType(createdUserType, langCode));
      }

      return {
        created,
        skipped,
        inserted: created.length,
        skippedCount: skipped.length,
      };
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async list(
    adminId: string,
    query: PaginationQuery & {
      searchKey?: string;
      status?: 'ACTIVE' | 'INACTIVE';
    },
    langCode: string = 'en',
  ) {
    const { offset, limit } = normalizePagination(query);
    const [totalCount, userTypes] = await adminUserTypeRepository.listByAdmin(
      adminId,
      limit,
      offset,
      {
        searchKey: query.searchKey,
        status: query.status,
      },
    );

    return {
      userTypes: userTypes.map((userType) =>
        formatUserType(userType, langCode),
      ),
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async getById(adminId: string, id: string, langCode: string = 'en') {
    const userType = await adminUserTypeRepository.findByIdAndAdmin(
      id,
      adminId,
    );

    if (!userType) {
      throw new Error('not found');
    }

    return formatUserType(userType, langCode);
  },

  async delete(adminId: string, id: string) {
    const existing = await adminUserTypeRepository.findByIdAndAdmin(
      id,
      adminId,
    );

    if (!existing) {
      throw new Error('not found');
    }

    await adminUserTypeRepository.softDelete(id);
  },
};
