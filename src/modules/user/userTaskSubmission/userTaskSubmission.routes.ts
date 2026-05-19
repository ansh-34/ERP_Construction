import { Router } from 'express';
import authMiddleware from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import { userTaskSubmissionController } from './userTaskSubmission.controller';
import {
  submitTaskBody,
  idParams,
} from './userTaskSubmission.validate';

const userTaskSubmissionRouter = Router();

userTaskSubmissionRouter.use(authMiddleware);

userTaskSubmissionRouter.put(
  '/:id/submit',
  validate(idParams, 'params'),
  validate(submitTaskBody, 'body'),
  userTaskSubmissionController.submit,
);

export default userTaskSubmissionRouter;
