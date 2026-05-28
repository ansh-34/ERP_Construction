import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import { idParamSchema } from '../../common/common.validator.js';
import {
  getJourneyScheduleStats,
  createJourneySchedule,
  listJourneySchedules,
  deleteJourneySchedule,
} from './journeySchedule.controller.js';
import {
  createJourneyScheduleBodySchema,
  listJourneySchedulesQuerySchema,
} from './journeySchedule.validator.js';

const router = Router();

// stats
router.get('/stats', authorize('JOURNEY', 'READ'), getJourneyScheduleStats);

// list
router.get(
  '/',
  authorize('JOURNEY', 'READ'),
  validate(listJourneySchedulesQuerySchema, 'query'),
  listJourneySchedules,
);

// create
router.post(
  '/',
  authorize('JOURNEY', 'CREATE'),
  validate(createJourneyScheduleBodySchema, 'body'),
  createJourneySchedule,
);

// delete
router.delete(
  '/:id',
  authorize('JOURNEY', 'DELETE'),
  validate(idParamSchema, 'params'),
  deleteJourneySchedule,
);

export default router;
