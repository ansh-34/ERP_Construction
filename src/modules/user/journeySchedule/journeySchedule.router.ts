import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import { idParamSchema } from '../../common/common.validator.js';
import {
  getJourneyScheduleStats,
  getJourneyScheduleById,
  createJourneySchedule,
  updateJourneySchedule,
  listJourneySchedules,
  deleteJourneySchedule,
} from './journeySchedule.controller.js';
import {
  createJourneyScheduleBodySchema,
  updateJourneyScheduleBodySchema,
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

// get by id
router.get(
  '/:id',
  authorize('JOURNEY', 'READ'),
  validate(idParamSchema, 'params'),
  getJourneyScheduleById,
);

// update
router.put(
  '/:id',
  authorize('JOURNEY', 'UPDATE'),
  validate(idParamSchema, 'params'),
  validate(updateJourneyScheduleBodySchema, 'body'),
  updateJourneySchedule,
);

// delete
router.delete(
  '/:id',
  authorize('JOURNEY', 'DELETE'),
  validate(idParamSchema, 'params'),
  deleteJourneySchedule,
);

export default router;
