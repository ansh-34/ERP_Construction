import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { JourneyScheduleService } from './journeySchedule.service.js';

export const getJourneyScheduleStats = async (req: Request, res: Response) => {
  try {
    const stats = await JourneyScheduleService.getStats(req.user!.domainId);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.JOURNEY_SCHEDULE.STATS_RETRIEVED,
      data: stats,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.JOURNEY_SCHEDULE.STATS_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const getJourneyScheduleById = async (req: Request, res: Response) => {
  try {
    const schedule = await JourneyScheduleService.getJourneyScheduleById(
      req.user!.domainId,
      req.params.id,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.JOURNEY_SCHEDULE.RETRIEVED,
      data: schedule,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.JOURNEY_SCHEDULE.GET_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const updateJourneySchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await JourneyScheduleService.updateJourneySchedule(
      req.user!.domainId,
      req.params.id,
      req.body,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.JOURNEY_SCHEDULE.UPDATED,
      data: schedule,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.JOURNEY_SCHEDULE.UPDATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const createJourneySchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await JourneyScheduleService.createJourneySchedule(
      req.user!.domainId,
      req.body,
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: Messages.JOURNEY_SCHEDULE.CREATED,
      data: schedule,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.JOURNEY_SCHEDULE.CREATE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const listJourneySchedules = async (req: Request, res: Response) => {
  try {
    const language = req.headers.language as string | undefined;
    const { schedules, pagination } =
      await JourneyScheduleService.listJourneySchedules(
        req.user!.domainId,
        req.query as PaginationQuery,
        language,
      );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.JOURNEY_SCHEDULE.RETRIEVED,
      pagination: {
        currentCount: schedules.length,
        ...pagination,
      },
      data: schedules,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.JOURNEY_SCHEDULE.LIST_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};

export const deleteJourneySchedule = async (req: Request, res: Response) => {
  try {
    await JourneyScheduleService.deleteJourneySchedule(
      req.user!.domainId,
      req.params.id,
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: Messages.JOURNEY_SCHEDULE.DELETED,
      data: null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : Messages.JOURNEY_SCHEDULE.DELETE_FAILED;
    const statusCode = resolveHttpStatus(message);
    return res.status(statusCode).json({ success: false, message });
  }
};
