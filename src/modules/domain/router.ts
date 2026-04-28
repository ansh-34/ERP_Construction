import { Router } from 'express';
import authRouter from './auth/router/auth.router';

const domainRouter = Router();

domainRouter.use('/auth', authRouter);

export default domainRouter;
