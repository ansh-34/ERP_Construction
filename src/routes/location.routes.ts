import { Router } from 'express';
import { locationController } from '@/controllers';

const locationRouter = Router();

locationRouter.post('/', locationController.create);
locationRouter.get('/', locationController.getAll);
locationRouter.get('/:id', locationController.getById);
locationRouter.put('/:id', locationController.update);
locationRouter.delete('/:id', locationController.delete);

export default locationRouter;
