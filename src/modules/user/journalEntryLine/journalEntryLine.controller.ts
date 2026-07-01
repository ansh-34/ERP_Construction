import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { UserJournalEntryLineService } from './journalEntryLine.service.js';

const failure = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  return res
    .status(resolveHttpStatus(message))
    .json({ success: false, message });
};

export const createJournalEntryLine = async (req: Request, res: Response) => {
  try {
    const data = await UserJournalEntryLineService.create(
      req.user!.domainId,
      req.user!.adminId,
      req.body,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Journal entry line created successfully',
      data,
    });
  } catch (error) {
    return failure(res, error, 'Failed to create journal entry line');
  }
};

export const listJournalEntryLines = async (req: Request, res: Response) => {
  try {
    const { data, pagination } = await UserJournalEntryLineService.list(
      req.user!.domainId,
      req.user!.adminId,
      req.query,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Journal entry lines retrieved successfully',
      pagination: { currentCount: data.length, ...pagination },
      data,
    });
  } catch (error) {
    return failure(res, error, 'Failed to list journal entry lines');
  }
};

export const getJournalEntryLine = async (req: Request, res: Response) => {
  try {
    const data = await UserJournalEntryLineService.getById(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Journal entry line retrieved successfully',
      data,
    });
  } catch (error) {
    return failure(res, error, 'Failed to get journal entry line');
  }
};

export const updateJournalEntryLine = async (req: Request, res: Response) => {
  try {
    const data = await UserJournalEntryLineService.update(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
      req.body,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Journal entry line updated successfully',
      data,
    });
  } catch (error) {
    return failure(res, error, 'Failed to update journal entry line');
  }
};

export const deleteJournalEntryLine = async (req: Request, res: Response) => {
  try {
    await UserJournalEntryLineService.delete(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Journal entry line deleted successfully',
      data: null,
    });
  } catch (error) {
    return failure(res, error, 'Failed to delete journal entry line');
  }
};
