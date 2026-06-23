import { Router } from 'express';
// import authorize from '../../../middlewares/authorize.js';
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
router.get(
  '/stats',
  // authorize('journeySchedule', 'read'),
  getJourneyScheduleStats,
);

// list
router.get(
  '/',
  // authorize('journeySchedule', 'read'),
  validate(listJourneySchedulesQuerySchema, 'query'),
  listJourneySchedules,
);

// create
router.post(
  '/',
  // authorize('journeySchedule', 'create'),
  validate(createJourneyScheduleBodySchema, 'body'),
  createJourneySchedule,
);

// get by id
router.get(
  '/:id',
  // authorize('journeySchedule', 'read'),
  validate(idParamSchema, 'params'),
  getJourneyScheduleById,
);

// update
router.put(
  '/:id',
  // authorize('journeySchedule', 'update'),
  validate(idParamSchema, 'params'),
  validate(updateJourneyScheduleBodySchema, 'body'),
  updateJourneySchedule,
);

// delete
router.delete(
  '/:id',
  // authorize('journeySchedule', 'delete'),
  validate(idParamSchema, 'params'),
  deleteJourneySchedule,
);

export default router;
