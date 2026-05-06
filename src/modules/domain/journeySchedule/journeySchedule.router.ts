import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createJourneySchedule,
  listJourneySchedules,
} from './journeySchedule.controller.js';
import {
  createJourneyScheduleBodySchema,
  listJourneySchedulesQuerySchema,
} from './journeySchedule.validator.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  authorize('journey', 'create'),
  validate(createJourneyScheduleBodySchema, 'body'),
  createJourneySchedule,
);
router.get(
  '/',
  authorize('journey', 'read'),
  validate(listJourneySchedulesQuerySchema, 'query'),
  listJourneySchedules,
);

export default router;
