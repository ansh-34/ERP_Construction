import { Router } from 'express';
import { locationController } from './location.controller';
import authMiddleware from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import {
  createLocationBody,
  domainIdQuery,
  idParams,
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
  validate(domainIdQuery, 'query'),
  locationController.getAll,
);
locationRouter.get(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  locationController.getById,
);
locationRouter.put(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  validate(updateLocationBody, 'body'),
  locationController.update,
);
locationRouter.delete(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  locationController.delete,
);

export default locationRouter;
