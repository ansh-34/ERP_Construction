import type { Request, Response } from 'express';
import fs from 'fs';
import ExcelJS from 'exceljs';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { InventoryService } from './inventory.service.js';

interface InventoryWorkbookWorksheet {
  name: string;
  columns: string[];
  rows: Record<string, any>[];
}

function buildWorkbook(
  worksheets: InventoryWorkbookWorksheet[],
): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Infoware Construction ERP';
  workbook.created = new Date();

  worksheets.forEach(({ name, columns, rows }) => {
    const worksheet = workbook.addWorksheet(name);
    worksheet.columns = columns.map((column) => ({
      header: column,
      key: column,
      width: Math.max(15, Math.min(column.length + 5, 30)),
    }));
    worksheet.addRows(rows);
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columns.length },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E78' },
    };
  });

  return workbook;
}

async function sendWorkbook(
  res: Response,
  worksheets: InventoryWorkbookWorksheet[],
  filenamePrefix: string,
): Promise<Response> {
  const workbook = buildWorkbook(worksheets);
  const buffer = await workbook.xlsx.writeBuffer();
  const date = new Date().toISOString().slice(0, 10);

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${filenamePrefix}-${date}.xlsx"`,
  );

  return res.status(HttpStatus.OK).send(Buffer.from(buffer));
}

// GET /inventory/stats
export const getInventoryStats = async (req: Request, res: Response) => {
  try {
    const stats = await InventoryService.getStats(req.user!.domainId);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.INVENTORY.STATS_RETRIEVED,
      data: stats,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.INVENTORY.STATS_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

// GET /inventory
export const listInventory = async (req: Request, res: Response) => {
  try {
    const { items, pagination } = await InventoryService.listInventory(
      req.user!.domainId,
      req.query as PaginationQuery & { status?: 'ACTIVE' | 'INACTIVE' },
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.INVENTORY.RETRIEVED,
      pagination: {
        currentCount: items.length,
        ...pagination,
      },
      data: items,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.INVENTORY.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

// POST /inventory
export const createInventoryEntry = async (req: Request, res: Response) => {
  try {
    const entry = await InventoryService.createEntry(
      req.user!.domainId,
      req.user!.adminId,
      req.body,
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.INVENTORY.CREATED,
      data: entry,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.INVENTORY.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

// PATCH /inventory/:id/reorder
export const updateReorderLevel = async (req: Request, res: Response) => {
  try {
    const entry = await InventoryService.updateReorderLevel(
      req.user!.domainId,
      req.params.id,
      req.body.reorderLevel,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.INVENTORY.REORDER_UPDATED,
      data: entry,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.INVENTORY.REORDER_UPDATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

// DELETE /inventory/:id
export const deleteInventoryEntry = async (req: Request, res: Response) => {
  try {
    await InventoryService.deleteEntry(req.user!.domainId, req.params.id);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.INVENTORY.DELETED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.INVENTORY.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

// POST /inventory/import
export const importInventory = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: Messages.INVENTORY.NO_FILE_UPLOADED,
      });
    }

    let filePath = req.file.path;
    if (!filePath && req.file.buffer) {
      if (!fs.existsSync('exports')) {
        fs.mkdirSync('exports', { recursive: true });
      }
      filePath = `exports/inventory-import-${Date.now()}.xlsx`;
      fs.writeFileSync(filePath, req.file.buffer);
    }

    const result = await InventoryService.importExcel(
      filePath!,
      req.user!.domainId,
      req.user!.adminId,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.INVENTORY.IMPORT_SUCCESS,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.INVENTORY.IMPORT_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

// GET /inventory/export
export const exportInventory = async (req: Request, res: Response) => {
  try {
    // Optional: a specific lang fills only that tab; omit to fill all domain langs.
    const langQuery = req.query.lang as string | undefined;
    const lang =
      langQuery &&
      langQuery.trim() !== '' &&
      langQuery.trim().toLowerCase() !== 'all'
        ? langQuery.trim()
        : undefined;

    const worksheets = await InventoryService.exportExcel(
      req.user!.domainId,
      req.user!.adminId,
      lang,
    );

    return sendWorkbook(res, worksheets, 'inventory');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : Messages.INVENTORY.EXPORT_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

// GET /inventory/analytics
export const getInventoryAnalytics = async (req: Request, res: Response) => {
  try {
    const data = await InventoryService.getAnalytics(req.user!.domainId);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Inventory analytics retrieved successfully',
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to retrieve inventory analytics';
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
