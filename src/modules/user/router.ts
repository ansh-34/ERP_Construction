import { Router } from 'express';

import authRouter from './auth/auth.router.js';

const domainRouter = Router();

domainRouter.use('/auth', authRouter);

export default domainRouter;
