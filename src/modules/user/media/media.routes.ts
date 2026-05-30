import { Router } from 'express';
import authorize from '@/middlewares/authorize';
import { upload } from '@/middlewares/upload';
import { validate } from '@/middlewares/validate';
import { mediaController } from './media.controller';
import {
  createMediaBody,
  idParams,
  listMediaQuery,
  updateMediaBody,
} from './media.validate';

const mediaRouter = Router();

mediaRouter.post(
  '/',
  authorize('MEDIA', 'CREATE'),
  upload.fields([
    { name: 'files', maxCount: 20 },
    { name: 'file', maxCount: 1 },
  ]),
  validate(createMediaBody, 'body'),
  mediaController.create,
);
mediaRouter.get(
  '/',
  authorize('MEDIA', 'READ'),
  validate(listMediaQuery, 'query'),
  mediaController.getAll,
);
mediaRouter.get(
  '/:id',
  authorize('MEDIA', 'READ'),
  validate(idParams, 'params'),
  mediaController.getById,
);
mediaRouter.put(
  '/:id',
  authorize('MEDIA', 'UPDATE'),
  validate(idParams, 'params'),
  validate(updateMediaBody, 'body'),
  mediaController.update,
);
mediaRouter.delete(
  '/:id',
  authorize('MEDIA', 'DELETE'),
  validate(idParams, 'params'),
  mediaController.delete,
);

export default mediaRouter;
