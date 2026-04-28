import { Router } from 'express';
import { mediaController } from '@/controllers';
import { upload } from '@/middlewares/upload';

const mediaRouter = Router();

mediaRouter.post('/', upload.single('file'), mediaController.create);
mediaRouter.get('/', mediaController.getAll);
mediaRouter.get('/:id', mediaController.getById);
mediaRouter.put('/:id', mediaController.update);
mediaRouter.delete('/:id', mediaController.delete);

export default mediaRouter;
