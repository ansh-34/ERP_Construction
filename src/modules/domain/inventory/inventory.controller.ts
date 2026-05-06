import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { InventoryService } from './inventory.service.js';

export const getInventory = async (req: Request, res: Response) => {
  try {
    const { items, pagination } = await InventoryService.getInventory(
      req.user!.domainId,
      req.query as PaginationQuery,
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
      error instanceof Error ? error.message : Messages.INVENTORY.FETCH_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const addItemToInventory = async (req: Request, res: Response) => {
  try {
    const item = await InventoryService.addItemToInventory(
      req.user!.domainId,
      req.body as {
        name: string;
        quantity: number;
        reorderLevel?: number;
        code?: string;
      },
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.INVENTORY.ITEM_ADDED,
      data: item,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.INVENTORY.ADD_ITEM_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
