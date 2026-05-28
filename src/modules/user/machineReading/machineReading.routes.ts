import { Router } from 'express';
import authorize from '@/middlewares/authorize';
import { validate } from '@/middlewares/validate';
import { machineReadingController } from './machineReading.controller';
import {
  createMachineReadingBody,
  endMachineReadingBody,
  idParams,
  listMachineReadingQuery,
  updateMachineReadingBody,
} from './machineReading.validate';

const machineReadingRouter = Router();

machineReadingRouter.post(
  '/',
  authorize('MACHINE_READING', 'CREATE'),
  validate(createMachineReadingBody, 'body'),
  machineReadingController.create,
);
machineReadingRouter.get(
  '/',
  authorize('MACHINE_READING', 'READ'),
  validate(listMachineReadingQuery, 'query'),
  machineReadingController.getAll,
);
machineReadingRouter.get(
  '/:id',
  authorize('MACHINE_READING', 'READ'),
  validate(idParams, 'params'),
  machineReadingController.getById,
);
machineReadingRouter.put(
  '/:id',
  authorize('MACHINE_READING', 'UPDATE'),
  validate(idParams, 'params'),
  validate(updateMachineReadingBody, 'body'),
  machineReadingController.update,
);
machineReadingRouter.put(
  '/:id/end',
  authorize('MACHINE_READING', 'UPDATE'),
  validate(idParams, 'params'),
  validate(endMachineReadingBody, 'body'),
  machineReadingController.end,
);

export default machineReadingRouter;
