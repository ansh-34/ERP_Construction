import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  getJourneyScheduleStats,
  createJourneySchedule,
  listJourneySchedules,
} from './journeySchedule.controller.js';
import {
  createJourneyScheduleBodySchema,
  listJourneySchedulesQuerySchema,
} from './journeySchedule.validator.js';

const router = Router();

router.use(authMiddleware);

// stats
router.get(
  '/stats',
  authorize('journeySchedule', 'read'),
  getJourneyScheduleStats,
);

// list
router.get(
  '/',
  authorize('journeySchedule', 'read'),
  validate(listJourneySchedulesQuerySchema, 'query'),
  listJourneySchedules,
);

// create
router.post(
  '/',
  authorize('journeySchedule', 'create'),
  validate(createJourneyScheduleBodySchema, 'body'),
  createJourneySchedule,
);

export default router;
