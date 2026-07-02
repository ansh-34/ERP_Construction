import { domainUserTypeRepository } from '@repositories/index';
import { normalizePagination } from '@/utils/pagination';
import { normalizePrismaError } from '@/utils/prismaError';
import prisma from '@/infra/database/prisma/prisma.client';

export const domainUserTypeService = {
  // List global UserTypes available for this domain's industry (not yet mapped).
  async listAvailable(
    domainId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      searchKey?: string;
      [key: string]: unknown;
    },
  ) {
    try {
      const domain = await prisma.domain.findUnique({
        where: { id: domainId },
        select: { industry: true },
      });
      if (!domain) throw new Error('domain not found');

      const mapped =
        await domainUserTypeRepository.findMappedUserTypeIds(domainId);
      const mappedIds = mapped.map((m) => m.userTypeId);

      const { offset, limit } = normalizePagination(query);
      const searchKey = (query.searchKey as string | undefined)?.trim() || '';

      const where = {
        industryType: domain.industry,
        isDeleted: false,
        ...(mappedIds.length > 0 ? { NOT: { id: { in: mappedIds } } } : {}),
        ...(searchKey
          ? {
              OR: [
                { code: { contains: searchKey, mode: 'insensitive' as const } },
                {
                  name: {
                    path: ['en'],
                    string_contains: searchKey,
                  },
                },
              ],
            }
          : {}),
      };

      const [totalCount, userTypes] = await prisma.$transaction([
        prisma.userType.count({ where }),
        prisma.userType.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
      ]);

      return { userTypes, pagination: { totalCount, offset, limit } };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  // Map one or more selected global UserTypes into this domain.
  async create(domainId: string, adminId: string, userTypeIds: string[]) {
    try {
      const domain = await prisma.domain.findUnique({
        where: { id: domainId },
        select: { industry: true },
      });
      if (!domain) throw new Error('domain not found');

      // Validate all provided IDs exist and belong to the domain's industry.
      const userTypes = await prisma.userType.findMany({
        where: { id: { in: userTypeIds }, isDeleted: false },
        select: { id: true, industryType: true },
      });

      if (userTypes.length !== userTypeIds.length)
        throw new Error('one or more user types not found');

      const wrongIndustry = userTypes.find(
        (ut) => ut.industryType !== domain.industry,
      );
      if (wrongIndustry)
        throw new Error('user type does not belong to domain industry');

      // Check for already-mapped duplicates.
      const existing = await Promise.all(
        userTypeIds.map((id) =>
          domainUserTypeRepository.findDuplicate(domainId, id),
        ),
      );
      if (existing.some(Boolean))
        throw new Error('one or more user types already mapped to this domain');

      return await domainUserTypeRepository.mapMany(
        domainId,
        adminId,
        userTypeIds,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async list(
    domainId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      searchKey?: string;
      [key: string]: unknown;
    },
  ) {
    try {
      const { offset, limit } = normalizePagination(query);
      const [totalCount, userTypes] =
        await domainUserTypeRepository.listByDomain(domainId, limit, offset, {
          searchKey: query.searchKey as string | undefined,
        });

      return { userTypes, pagination: { totalCount, offset, limit } };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async getById(domainId: string, id: string) {
    try {
      const userType = await domainUserTypeRepository.findByIdAndDomain(
        id,
        domainId,
      );
      if (!userType) throw new Error('user type not found');
      return userType;
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async softDelete(domainId: string, id: string) {
    try {
      const existing = await domainUserTypeRepository.findByIdAndDomain(
        id,
        domainId,
      );
      if (!existing) throw new Error('user type not found');
      return await domainUserTypeRepository.softDelete(id);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
