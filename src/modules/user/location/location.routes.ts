import { Router } from 'express';
import authMiddleware from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import { locationController } from './location.controller';
import {
  createLocationBody,
  idParams,
  listLocationQuery,
  updateLocationBody,
} from './location.validate';

const locationRouter = Router();

locationRouter.use(authMiddleware);

locationRouter.post(
  '/',
  validate(createLocationBody, 'body'),
  locationController.create,
);

locationRouter.get(
  '/',
  validate(listLocationQuery, 'query'),
  locationController.getAll,
);

locationRouter.get(
  '/:id',
  validate(idParams, 'params'),
  locationController.getById,
);

locationRouter.put(
  '/:id',
  validate(idParams, 'params'),
  validate(updateLocationBody, 'body'),
  locationController.update,
);

locationRouter.delete(
  '/:id',
  validate(idParams, 'params'),
  locationController.delete,
);

export default locationRouter;
