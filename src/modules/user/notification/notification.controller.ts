import type { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { resolveHttpStatus } from '@/utils/httpError';
import { notificationService } from './notification.service';

export const notificationController = {
  getAll: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { notifications, pagination } = await notificationService.getAll(
        req.user!.domainId,
        req.user!.adminId,
        req.query,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Notifications fetched successfully',
        pagination,
        data: notifications,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch notifications';
      return res
        .status(resolveHttpStatus(message))
        .json({ success: false, message });
    }
  },

  getById: async (req: Request, res: Response): Promise<Response> => {
    try {
      const notification = await notificationService.getById(
        req.params.id,
        req.user!.domainId,
        req.user!.adminId,
      );

      if (!notification) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: 'Notification not found' });
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Notification fetched successfully',
        data: notification,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch notification';
      return res
        .status(resolveHttpStatus(message))
        .json({ success: false, message });
    }
  },

  markRead: async (req: Request, res: Response): Promise<Response> => {
    try {
      const notification = await notificationService.markRead(
        req.params.id,
        req.user!.domainId,
        req.user!.adminId,
      );

      if (!notification) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: 'Notification not found' });
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Notification marked as read successfully',
        data: notification,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to mark notification as read';
      return res
        .status(resolveHttpStatus(message))
        .json({ success: false, message });
    }
  },

  markAllRead: async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await notificationService.markAllRead(
        req.user!.domainId,
        req.user!.adminId,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Notifications marked as read successfully',
        data: result,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to mark notifications as read';
      return res
        .status(resolveHttpStatus(message))
        .json({ success: false, message });
    }
  },
};
