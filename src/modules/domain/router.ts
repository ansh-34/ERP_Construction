import { Router } from 'express';
import apiKeyRouter from './apiKey/apiKey.routes';
import locationRouter from './location/location.routes';
import mediaRouter from './media/media.routes';
import projectRouter from './project/project.routes';
import projectCategoryRouter from './projectCategory/projectCategory.routes';
import projectStageRouter from './projectStage/projectStage.routes';

const domainRouter = Router();

domainRouter.use('/api-keys', apiKeyRouter);
domainRouter.use('/media', mediaRouter);
domainRouter.use('/locations', locationRouter);
domainRouter.use('/project-categories', projectCategoryRouter);
domainRouter.use('/projects', projectRouter);
domainRouter.use('/project-stages', projectStageRouter);

export default domainRouter;
