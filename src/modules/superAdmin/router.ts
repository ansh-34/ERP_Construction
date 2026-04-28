import { Router } from 'express';

import moduleRouter from './module/router/module.router';
import permissionRouter from './permission/router/permission.router';
import authRouter from './auth/router/auth.router';
import domainRouter from './domain/router/domain.router';

const superAdminRouter = Router();

superAdminRouter.use('/module', moduleRouter);
superAdminRouter.use('/permission', permissionRouter);
superAdminRouter.use('/auth', authRouter);
superAdminRouter.use('/domain', domainRouter);

export default superAdminRouter;
