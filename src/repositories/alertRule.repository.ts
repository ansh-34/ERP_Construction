import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import type {
  AlertSeverity,
  Prisma,
} from '@infra/database/prisma/generated/prisma/client';

export interface UpsertAlertRuleInput {
  moduleCode: string;
  alertCode: string;
  name: string;
  description?: string | null;
  config?: Prisma.InputJsonValue;
  severity?: AlertSeverity;
  isEnabled?: boolean;
  domainId: string;
  adminId: string;
  status?: StatusEnum;
}

export const alertRuleRepository = {
  upsert(data: UpsertAlertRuleInput) {
    return prisma.alertRule.upsert({
      where: {
        moduleCode_alertCode_domainId_isDeleted: {
          moduleCode: data.moduleCode,
          alertCode: data.alertCode,
          domainId: data.domainId,
          isDeleted: false,
        },
      },
      create: {
        moduleCode: data.moduleCode,
        alertCode: data.alertCode,
        name: data.name,
        description: data.description,
        config: data.config,
        severity: data.severity ?? 'WARNING',
        isEnabled: data.isEnabled ?? true,
        domainId: data.domainId,
        adminId: data.adminId,
        status: data.status ?? StatusEnum.ACTIVE,
      },
      update: {
        name: data.name,
        description: data.description,
        config: data.config,
        severity: data.severity ?? 'WARNING',
        isEnabled: data.isEnabled ?? true,
        status: data.status ?? StatusEnum.ACTIVE,
      },
    });
  },

  findByCode(
    domainId: string,
    adminId: string,
    moduleCode: string,
    alertCode: string,
  ) {
    return prisma.alertRule.findFirst({
      where: {
        domainId,
        adminId,
        moduleCode,
        alertCode,
        isDeleted: false,
      },
    });
  },
};
