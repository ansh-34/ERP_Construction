import type { AlertStatus } from '@infra/database/prisma/generated/prisma/client';
import { alertRepository } from '@repositories/index';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import { normalizePrismaError } from '@/utils/prismaError';
import { isNonEmptyString } from '@/utils/validation';

type AlertRecord = Awaited<ReturnType<typeof alertRepository.findById>>;

type PaginatedAlerts = {
  alerts: Awaited<ReturnType<typeof alertRepository.list>>;
  pagination: {
    totalCount: number;
    currentCount: number;
    offset: number;
    limit: number;
  };
};

export const alertService = {
  async getAll(
    domainId: string,
    adminId: string,
    query: PaginationQuery & {
      moduleCode?: string;
      alertCode?: string;
      alertStatus?: AlertStatus;
      entityType?: string;
      entityId?: string;
      searchKey?: string;
    },
  ): Promise<PaginatedAlerts> {
    if (!isNonEmptyString(domainId)) throw new Error('invalid domainId');
    if (!isNonEmptyString(adminId)) throw new Error('invalid adminId');

    try {
      const { offset, limit } = normalizePagination(query);
      const filters = {
        moduleCode: query.moduleCode,
        alertCode: query.alertCode,
        alertStatus: query.alertStatus,
        entityType: query.entityType,
        entityId: query.entityId,
        searchKey: query.searchKey,
      };

      const [totalCount, alerts] = await Promise.all([
        alertRepository.count(domainId, adminId, filters),
        alertRepository.list(domainId, adminId, filters, offset, limit),
      ]);

      return {
        alerts,
        pagination: {
          totalCount,
          currentCount: alerts.length,
          offset,
          limit,
        },
      };
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async getById(
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<AlertRecord> {
    if (!isNonEmptyString(id)) throw new Error('invalid id');

    try {
      return await alertRepository.findById(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async updateStatus(
    id: string,
    domainId: string,
    adminId: string,
    alertStatus: AlertStatus,
  ): Promise<AlertRecord> {
    if (!isNonEmptyString(id)) throw new Error('invalid id');

    try {
      const result = await alertRepository.updateStatus(
        id,
        domainId,
        adminId,
        alertStatus,
      );
      if (result.count === 0) return null;

      return await alertRepository.findById(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
