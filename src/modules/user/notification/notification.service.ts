import type { NotificationRecipientType } from '@infra/database/prisma/generated/prisma/client';
import { notificationRepository } from '@repositories/index';
import { normalizePagination, type PaginationQuery } from '@/utils/pagination';
import { normalizePrismaError } from '@/utils/prismaError';
import { isNonEmptyString } from '@/utils/validation';

type NotificationRecord = Awaited<
  ReturnType<typeof notificationRepository.findById>
>;

type PaginatedNotifications = {
  notifications: Awaited<ReturnType<typeof notificationRepository.list>>;
  pagination: {
    totalCount: number;
    currentCount: number;
    offset: number;
    limit: number;
  };
};

export const notificationService = {
  async getAll(
    domainId: string,
    adminId: string,
    query: PaginationQuery & {
      recipientType?: NotificationRecipientType;
      recipientId?: string;
      isRead?: boolean;
    },
  ): Promise<PaginatedNotifications> {
    if (!isNonEmptyString(domainId)) throw new Error('invalid domainId');
    if (!isNonEmptyString(adminId)) throw new Error('invalid adminId');

    try {
      const { offset, limit } = normalizePagination(query);
      const filters = {
        recipientType: query.recipientType,
        recipientId: query.recipientId,
        isRead: query.isRead,
      };

      const [totalCount, notifications] = await Promise.all([
        notificationRepository.count(domainId, adminId, filters),
        notificationRepository.list(domainId, adminId, filters, offset, limit),
      ]);

      return {
        notifications,
        pagination: {
          totalCount,
          currentCount: notifications.length,
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
  ): Promise<NotificationRecord> {
    if (!isNonEmptyString(id)) throw new Error('invalid id');

    try {
      return await notificationRepository.findById(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async markRead(
    id: string,
    domainId: string,
    adminId: string,
  ): Promise<NotificationRecord> {
    if (!isNonEmptyString(id)) throw new Error('invalid id');

    try {
      const result = await notificationRepository.markRead(
        id,
        domainId,
        adminId,
      );
      if (result.count === 0) return null;

      return await notificationRepository.findById(id, domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  async markAllRead(
    domainId: string,
    adminId: string,
  ): Promise<{ count: number }> {
    if (!isNonEmptyString(domainId)) throw new Error('invalid domainId');
    if (!isNonEmptyString(adminId)) throw new Error('invalid adminId');

    try {
      return await notificationRepository.markAllRead(domainId, adminId);
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
