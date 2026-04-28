import { Router } from 'express';
import { projectStageController } from '@/controllers';

const projectStageRouter = Router();

projectStageRouter.post('/', projectStageController.create);
projectStageRouter.get('/', projectStageController.getAll);
projectStageRouter.get('/:id', projectStageController.getById);
projectStageRouter.put('/:id', projectStageController.update);
projectStageRouter.delete('/:id', projectStageController.delete);

export default projectStageRouter;
