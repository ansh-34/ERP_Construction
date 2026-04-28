import { Router } from 'express';
import { projectCategoryController } from '@/controllers';

const projectCategoryRouter = Router();

projectCategoryRouter.post('/', projectCategoryController.create);
projectCategoryRouter.get('/', projectCategoryController.getAll);
projectCategoryRouter.get('/:id', projectCategoryController.getById);
projectCategoryRouter.put('/:id', projectCategoryController.update);
projectCategoryRouter.delete('/:id', projectCategoryController.delete);

export default projectCategoryRouter;
