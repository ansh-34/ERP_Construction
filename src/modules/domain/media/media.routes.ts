import { Router } from 'express';
import { mediaController } from './media.controller';
import { upload } from '@/middlewares/upload';
import { validate } from '@/middlewares/validate';
import {
  createMediaBody,
  domainIdQuery,
  idParams,
  updateMediaBody,
} from './media.validate';

const mediaRouter = Router();

mediaRouter.post(
  '/',
  upload.fields([
    { name: 'files', maxCount: 20 },
    { name: 'file', maxCount: 1 },
  ]),
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
