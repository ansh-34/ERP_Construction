import { Router } from 'express';
import { apiKeyController } from '@/controllers';

const apiKeyRouter = Router();

apiKeyRouter.post('/', apiKeyController.create);
apiKeyRouter.get('/', apiKeyController.getAll);
apiKeyRouter.get('/:id', apiKeyController.getById);
apiKeyRouter.put('/:id', apiKeyController.update);
apiKeyRouter.delete('/:id', apiKeyController.delete);

export default apiKeyRouter;
