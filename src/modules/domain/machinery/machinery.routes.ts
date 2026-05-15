import { Router } from 'express';
import authMiddleware from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import { machineryController } from './machinery.controller';
import {
  createMachineryBody,
  domainIdQuery,
  idParams,
  listMachineryQuery,
  updateMachineryBody,
} from './machinery.validate';

const machineryRouter = Router();

machineryRouter.use(authMiddleware);

machineryRouter.post(
  '/',
  validate(createMachineryBody, 'body'),
  machineryController.create,
);
machineryRouter.get(
  '/',
  validate(listMachineryQuery, 'query'),
  machineryController.getAll,
);
machineryRouter.get(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  machineryController.getById,
);
machineryRouter.put(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  validate(updateMachineryBody, 'body'),
  machineryController.update,
);
machineryRouter.delete(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  machineryController.delete,
);

export default machineryRouter;
