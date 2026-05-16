import { Router } from 'express';
import { apiKeyController } from './apiKey.controller';
import authMiddleware from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import {
  createApiKeyBody,
  domainIdQuery,
  idParams,
  updateApiKeyBody,
} from './apiKey.validate';

const apiKeyRouter = Router();

apiKeyRouter.use(authMiddleware);

apiKeyRouter.post(
  '/',
  validate(createApiKeyBody, 'body'),
  apiKeyController.create,
);
apiKeyRouter.get(
  '/',
  validate(domainIdQuery, 'query'),
  apiKeyController.getAll,
);
apiKeyRouter.get(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  apiKeyController.getById,
);
apiKeyRouter.put(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  validate(updateApiKeyBody, 'body'),
  apiKeyController.update,
);
apiKeyRouter.delete(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  apiKeyController.delete,
);

export default apiKeyRouter;
