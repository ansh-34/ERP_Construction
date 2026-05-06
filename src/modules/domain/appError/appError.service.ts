import { Messages } from '../../../constants/index.js';
import {
  AppErrorRepository,
  DomainRepository,
} from '../../../repositories/index.js';
import type { DatePaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { CreateAppErrorData } from './appError.validator.js';

export const AppErrorService = {
  async createAppError(domainId: string, data: CreateAppErrorData) {
    const { deviceName, version, error, functionName } = data;

    if (!deviceName || !version || !error || !functionName) {
      throw new Error(Messages.APP_ERROR.REQUIRED_FIELDS);
    }

    const domain = await DomainRepository.findActiveById(domainId);

    if (!domain) {
      throw new Error(Messages.DOMAIN.NOT_FOUND);
    }

    return AppErrorRepository.create({
      deviceName,
      version,
      error,
      functionName,
      domainId,
    });
  },

  async listAppErrors(domainId: string, query: DatePaginationQuery) {
    const { offset, limit } = normalizePagination(query);
    const startDate = query.from;
    const endDate = query.to;

    const whereClause: any = {
      domainId,
    };

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate);
      }
    }

    const [totalCount, appErrors] = await AppErrorRepository.listByDomain(
      whereClause,
      limit,
      offset,
    );

    return {
      appErrors,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },
};
