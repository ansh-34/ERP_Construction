import { Router } from 'express';
import { validate } from '@/middlewares/validate';
import { machineReadingController } from './machineReading.controller';
import {
  createMachineReadingBody,
  domainIdQuery,
  idParams,
  listMachineReadingQuery,
  updateMachineReadingBody,
} from './machineReading.validate';

const machineReadingRouter = Router();

machineReadingRouter.post(
  '/',
  validate(createMachineReadingBody, 'body'),
  machineReadingController.create,
);
machineReadingRouter.get(
  '/',
  validate(listMachineReadingQuery, 'query'),
  machineReadingController.getAll,
);
machineReadingRouter.get(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  machineReadingController.getById,
);
machineReadingRouter.put(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  validate(updateMachineReadingBody, 'body'),
  machineReadingController.update,
);

export default machineReadingRouter;