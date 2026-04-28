import { Router } from 'express';
import { projectController } from '@/controllers';

const projectRouter = Router();

projectRouter.post('/', projectController.create);
projectRouter.get('/', projectController.getAll);
projectRouter.get('/:id', projectController.getById);
projectRouter.put('/:id', projectController.update);
projectRouter.delete('/:id', projectController.delete);

export default projectRouter;
