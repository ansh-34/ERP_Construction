import { Router } from 'express';
import authorize from '@/middlewares/authorize';
import { validate } from '@/middlewares/validate';
import { machineryController } from './machinery.controller';
import {
  createMachineryBody,
  idParams,
  listMachineryQuery,
  updateMachineryBody,
} from './machinery.validate';

const machineryRouter = Router();

machineryRouter.post(
  '/',
  authorize('MACHINERY', 'CREATE'),
  validate(createMachineryBody, 'body'),
  machineryController.create,
);
machineryRouter.get(
  '/',
  authorize('MACHINERY', 'READ'),
  validate(listMachineryQuery, 'query'),
  machineryController.getAll,
);
machineryRouter.get(
  '/:id',
  authorize('MACHINERY', 'READ'),
  validate(idParams, 'params'),
  machineryController.getById,
);
machineryRouter.put(
  '/:id',
  authorize('MACHINERY', 'UPDATE'),
  validate(idParams, 'params'),
  validate(updateMachineryBody, 'body'),
  machineryController.update,
);
machineryRouter.delete(
  '/:id',
  authorize('MACHINERY', 'DELETE'),
  validate(idParams, 'params'),
  machineryController.delete,
);

export default machineryRouter;
