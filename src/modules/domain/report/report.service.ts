import { StatusEnum } from '@constants/index';
import prisma from '@/infra/database/prisma/prisma.client';
import { normalizePrismaError } from '@/utils/prismaError';
import { isPlainObject } from '@/utils/validation';

type ReportType = 'summary';

type SummaryProject = {
  project: string;
  country: string;
  budget: number;
  spent: number;
};

export type SummaryExportProject = SummaryProject & {
  id: string;
  code: string;
  status: string;
  utilization: number;
  expectedStartDate: Date | null;
  expectedEndDate: Date | null;
  actualStartDate: Date | null;
  actualEndDate: Date | null;
};

type SummaryAnalytics = {
  projectCount: number;
  budget: number;
  spent: number;
  utilization: number;
  projects: SummaryProject[];
};

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function getLocalizedText(value: unknown, language: string | null): string {
  if (!isPlainObject(value)) {
    return value === null || value === undefined ? '' : String(value);
  }

  const langCode = language || 'en';
  const localizedValue = value[langCode] ?? value.en ?? '';

  return typeof localizedValue === 'string'
    ? localizedValue
    : String(localizedValue);
}

function normalizeCountry(country?: string): string | undefined {
  const value = country?.trim();

  if (!value || value.toLowerCase() === 'all') {
    return undefined;
  }

  return value;
}

async function getSummaryReport(
  domainId: string,
  country: string | undefined,
  language: string | null,
): Promise<{ analytics: SummaryAnalytics }> {
  const summaryProjects = (
    await getSummaryExportProjects(domainId, country, language)
  ).map((project) => ({
    project: project.project,
    country: project.country,
    budget: project.budget,
    spent: project.spent,
  }));

  const budget = summaryProjects.reduce(
    (total, project) => total + project.budget,
    0,
  );
  const spent = summaryProjects.reduce(
    (total, project) => total + project.spent,
    0,
  );

  return {
    analytics: {
      projectCount: summaryProjects.length,
      budget: roundToTwo(budget),
      spent: roundToTwo(spent),
      utilization: budget > 0 ? roundToTwo((spent / budget) * 100) : 0,
      projects: summaryProjects,
    },
  };
}

async function getSummaryExportProjects(
  domainId: string,
  country: string | undefined,
  language: string | null,
): Promise<SummaryExportProject[]> {
  const countryFilter = normalizeCountry(country);

  const projects = await prisma.project.findMany({
    where: {
      domainId,
      isDeleted: false,
      status: StatusEnum.ACTIVE,
      ...(countryFilter
        ? {
            location: {
              is: {
                domainId,
                isDeleted: false,
                OR: [
                  {
                    code: {
                      equals: countryFilter,
                      mode: 'insensitive',
                    },
                  },
                  {
                    searchText: {
                      contains: countryFilter.toLowerCase(),
                    },
                  },
                ],
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
      budget: true,
      spent: true,
      expectedStartDate: true,
      expectedEndDate: true,
      actualStartDate: true,
      actualEndDate: true,
      location: {
        select: {
          code: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return projects.map((project) => {
    const budget = toNumber(project.budget);
    const spent = toNumber(project.spent);

    return {
      id: project.id,
      project: getLocalizedText(project.name, language),
      code: project.code,
      country:
        project.location?.code ||
        getLocalizedText(project.location?.name, language),
      status: project.status,
      budget,
      spent,
      utilization: budget > 0 ? roundToTwo((spent / budget) * 100) : 0,
      expectedStartDate: project.expectedStartDate,
      expectedEndDate: project.expectedEndDate,
      actualStartDate: project.actualStartDate,
      actualEndDate: project.actualEndDate,
    };
  });
}

export const reportService = {
  getReport: async (
    domainId: string,
    reportType: ReportType,
    filters: { country?: string },
    language: string | null = null,
  ) => {
    try {
      if (reportType === 'summary') {
        return await getSummaryReport(domainId, filters.country, language);
      }

      throw new Error('invalid reportType');
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },

  getSummaryExportProjects: async (
    domainId: string,
    filters: { country?: string },
    language: string | null = null,
  ): Promise<SummaryExportProject[]> => {
    try {
      return await getSummaryExportProjects(
        domainId,
        filters.country,
        language,
      );
    } catch (error: unknown) {
      throw normalizePrismaError(error);
    }
  },
};
