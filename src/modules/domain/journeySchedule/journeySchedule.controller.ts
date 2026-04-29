import type { Request, Response } from 'express';
import { HttpStatus, Messages } from '../../../constants/index.js';
import { resolveHttpStatus } from '../../../utils/httpError.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { JourneyScheduleService } from './journeySchedule.service.js';

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
    const { schedules, pagination } =
      await JourneyScheduleService.listJourneySchedules(
        req.user!.domainId,
        req.query as PaginationQuery,
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
