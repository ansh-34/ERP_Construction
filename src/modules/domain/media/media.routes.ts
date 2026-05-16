import { Router } from 'express';
import { mediaController } from './media.controller';
import authMiddleware from '@/middlewares/auth';
import { upload } from '@/middlewares/upload';
import { validate } from '@/middlewares/validate';
import {
  createMediaBody,
  domainIdQuery,
  idParams,
  updateMediaBody,
} from './media.validate';

const mediaRouter = Router();

mediaRouter.use(authMiddleware);

mediaRouter.post(
  '/',
  upload.single('file'),
  validate(createMediaBody, 'body'),
  mediaController.create,
);
mediaRouter.get('/', validate(domainIdQuery, 'query'), mediaController.getAll);
mediaRouter.get(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  mediaController.getById,
);
mediaRouter.put(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  validate(updateMediaBody, 'body'),
  mediaController.update,
);
mediaRouter.delete(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  mediaController.delete,
);

export default mediaRouter;
