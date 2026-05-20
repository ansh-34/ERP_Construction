import { Request, Response } from 'express';
import { HttpStatus } from '@constants/httpStatus';
import { resolveHttpStatus } from '@/utils/httpError';
import { userTaskSubmissionService } from './userTaskSubmission.service';

export const userTaskSubmissionController = {
  submit: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as { id?: string };
      const { actualEndDate, taskProgress } = req.body as {
        actualEndDate?: string;
        taskProgress?: number;
        // notes?: string;
      };
      const language = req.body.language || req.headers.language || 'en';

      const submittedTask = await userTaskSubmissionService.submit(
        id ?? '',
        req.user!.domainId,
        req.user!.userId,
        actualEndDate ?? '',
        taskProgress,
        language as string,
      );

      return res.status(HttpStatus.OK).json({
        message: 'Task submitted successfully',
        data: submittedTask,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit task';
      return res.status(resolveHttpStatus(message)).json({ message });
    }
  },
};
