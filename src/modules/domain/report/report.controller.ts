import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { resolveHttpStatus } from '@/utils/httpError';
import { reportService, type SummaryExportProject } from './report.service';

function formatDate(value: Date | null): string {
  return value ? value.toISOString().slice(0, 10) : '';
}

function escapeCsvValue(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function buildSummaryCsv(projects: SummaryExportProject[]): string {
  const headers = [
    'id',
    'project',
    'code',
    'country',
    'status',
    'budget',
    'spent',
    'utilization',
    'expectedStartDate',
    'expectedEndDate',
    'actualStartDate',
    'actualEndDate',
  ];

  const rows = projects.map((project) =>
    [
      project.id,
      project.project,
      project.code,
      project.country,
      project.status,
      project.budget,
      project.spent,
      project.utilization,
      formatDate(project.expectedStartDate),
      formatDate(project.expectedEndDate),
      formatDate(project.actualStartDate),
      formatDate(project.actualEndDate),
    ]
      .map(escapeCsvValue)
      .join(','),
  );

  return [headers.join(','), ...rows].join('\r\n');
}

export const reportController = {
  getReport: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language = (req.headers.language as string) || 'en';
      const { reportType, country } = req.query as {
        reportType: 'summary';
        country?: string;
      };

      const report = await reportService.getReport(
        req.user!.domainId,
        reportType,
        { country },
        language,
      );

      return res.status(HttpStatus.OK).json({
        message: 'Report fetched successfully',
        data: report,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },

  exportReport: async (req: Request, res: Response): Promise<Response> => {
    try {
      const language = (req.headers.language as string) || 'en';
      const { reportType, country } = req.query as {
        reportType: 'summary';
        export: 'csv';
        country?: string;
      };

      if (reportType !== 'summary') {
        throw new Error('invalid reportType');
      }

      const projects = await reportService.getSummaryExportProjects(
        req.user!.domainId,
        { country },
        language,
      );
      const csv = buildSummaryCsv(projects);
      const date = new Date().toISOString().slice(0, 10);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="summary-report-${date}.csv"`,
      );

      return res.status(HttpStatus.OK).send(csv);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to export report';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
