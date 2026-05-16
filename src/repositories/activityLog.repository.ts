import prisma from '../infra/database/prisma/prisma.client';

import {
  ActivityLogPayload
} from '../modules/domain/activityLog/type';

class ActivityLogRepository {

  async create(
    payload: ActivityLogPayload
  ) {

    return prisma.activityLog.create({

      data: payload as any
    });
  }

  async findMany(
    where: Record<string, unknown>,
    skip: number,
    take: number
  ) {

    return prisma.activityLog.findMany({

      where,

      skip,

      take,

      orderBy: {

        updatedAt: 'desc'
      }
    });
  }

  async count(
    where: Record<string, unknown>
  ) {

    return prisma.activityLog.count({

      where
    });
  }
}

export default
new ActivityLogRepository();