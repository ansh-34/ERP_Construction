import type { Request, Response } from 'express';
import { HttpStatus } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import { JournalEntryService } from './journalEntry.service.js';

const failure = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  return res
    .status(resolveHttpStatus(message))
    .json({ success: false, message });
};

export const createJournalEntry = async (req: Request, res: Response) => {
  try {
    const data = await JournalEntryService.create(
      req.user!.domainId,
      req.user!.adminId,
      req.body,
    );
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Journal entry created successfully',
      data,
    });
  } catch (error) {
    return failure(res, error, 'Failed to create journal entry');
  }
};

export const listJournalEntries = async (req: Request, res: Response) => {
  try {
    const { data, pagination } = await JournalEntryService.list(
      req.user!.domainId,
      req.user!.adminId,
      req.query,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Journal entries retrieved successfully',
      pagination: { currentCount: data.length, ...pagination },
      data,
    });
  } catch (error) {
    return failure(res, error, 'Failed to list journal entries');
  }
};

export const getJournalEntry = async (req: Request, res: Response) => {
  try {
    const data = await JournalEntryService.getById(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Journal entry retrieved successfully',
      data,
    });
  } catch (error) {
    return failure(res, error, 'Failed to get journal entry');
  }
};

export const updateJournalEntry = async (req: Request, res: Response) => {
  try {
    const data = await JournalEntryService.update(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
      req.body,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Journal entry updated successfully',
      data,
    });
  } catch (error) {
    return failure(res, error, 'Failed to update journal entry');
  }
};

export const deleteJournalEntry = async (req: Request, res: Response) => {
  try {
    await JournalEntryService.delete(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Journal entry deleted successfully',
      data: null,
    });
  } catch (error) {
    return failure(res, error, 'Failed to delete journal entry');
  }
};

export const postJournalEntry = async (req: Request, res: Response) => {
  try {
    const data = await JournalEntryService.post(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Journal entry posted successfully',
      data,
    });
  } catch (error) {
    return failure(res, error, 'Failed to post journal entry');
  }
};

export const reverseJournalEntry = async (req: Request, res: Response) => {
  try {
    const data = await JournalEntryService.reverse(
      req.user!.domainId,
      req.user!.adminId,
      req.params.id,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Journal entry debit and credit reversed successfully',
      data,
    });
  } catch (error) {
    return failure(res, error, 'Failed to reverse journal entry');
  }
};
