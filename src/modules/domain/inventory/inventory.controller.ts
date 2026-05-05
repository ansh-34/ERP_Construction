import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { InventoryService } from './inventory.service.js';

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
      error instanceof Error
        ? error.message
        : Messages.INVENTORY.STATS_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

// GET /inventory
export const listInventory = async (req: Request, res: Response) => {
  try {
    const { items, pagination } = await InventoryService.listInventory(
      req.user!.domainId,
      req.query as PaginationQuery & { status?: string },
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
      req.body,
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.INVENTORY.CREATED,
      data: entry,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.INVENTORY.CREATE_FAILED;
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
