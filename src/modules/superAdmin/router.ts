import { Router } from 'express';

import authRouter from './auth/auth.router.js';
import domainRouter from './domain/domain.router.js';
import moduleRouter from './module/module.router.js';
import moduleDependencyRouter from './moduleDependency/moduleDependency.router.js';
import modulePermissionRouter from './modulePermission/modulePermission.router.js';
import permissionRouter from './permission/permission.router.js';
import profileRouter from './profile/profile.router.js';
import languageRouter from './language/language.router.js';

const superAdminRouter = Router();

superAdminRouter.use('/domain', domainRouter);
superAdminRouter.use('/profile', profileRouter);
superAdminRouter.use('/auth', authRouter);
superAdminRouter.use('/modules', moduleRouter);
superAdminRouter.use('/module-dependencies', moduleDependencyRouter);
superAdminRouter.use('/module-permissions', modulePermissionRouter);
superAdminRouter.use('/permissions', permissionRouter);
superAdminRouter.use('/language', languageRouter);

export default superAdminRouter;
