import prisma from '@/infra/database/prisma/prisma.client';
import type { NotificationRecipientType } from '@infra/database/prisma/generated/prisma/client';

export interface CreateNotificationInput {
  alertId?: string | null;
  recipientType: NotificationRecipientType;
  recipientId: string;
  title: string;
  message: string;
  domainId: string;
  adminId?: string | null;
}

export interface NotificationFilters {
  isRead?: boolean;
  recipientType?: NotificationRecipientType;
  recipientId?: string;
}

const notificationInclude = {
  alert: {
    select: {
      id: true,
      moduleCode: true,
      alertCode: true,
      entityType: true,
      entityId: true,
      severity: true,
      alertStatus: true,
      metadata: true,
    },
  },
} as const;

export const notificationRepository = {
  createMany(data: CreateNotificationInput[]) {
    if (data.length === 0) return Promise.resolve({ count: 0 });
    return prisma.notification.createMany({ data });
  },

  list(
    domainId: string,
    adminId: string,
    filters: NotificationFilters = {},
    offset = 0,
    limit = 10,
  ) {
    return prisma.notification.findMany({
      where: buildWhere(domainId, adminId, filters),
      include: notificationInclude,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });
  },

  count(domainId: string, adminId: string, filters: NotificationFilters = {}) {
    return prisma.notification.count({
      where: buildWhere(domainId, adminId, filters),
    });
  },

  findById(id: string, domainId: string, adminId: string) {
    return prisma.notification.findFirst({
      where: { id, domainId, adminId },
      include: notificationInclude,
    });
  },

  markRead(id: string, domainId: string, adminId: string) {
    return prisma.notification.updateMany({
      where: { id, domainId, adminId },
      data: { isRead: true, readAt: new Date() },
    });
  },

  markAllRead(domainId: string, adminId: string) {
    return prisma.notification.updateMany({
      where: { domainId, adminId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  },
};

function buildWhere(
  domainId: string,
  adminId: string,
  filters: NotificationFilters,
) {
  return {
    domainId,
    adminId,
    ...(filters.isRead !== undefined ? { isRead: filters.isRead } : {}),
    ...(filters.recipientType ? { recipientType: filters.recipientType } : {}),
    ...(filters.recipientId ? { recipientId: filters.recipientId } : {}),
  };
}
