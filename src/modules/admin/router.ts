import { Router } from 'express';

import authRouter from './auth/auth.router.js';
import languageRouter from './language/language.router.js';
import currencyRouter from './currency/currency.router.js';
import onboardingRouter from './onboarding/onboarding.router.js';
import domainRouter from './domain/domain.router.js';
import profileRouter from './profile/profile.router.js';
import reportRouter from './report/report.router.js';

const adminRouter = Router();

adminRouter.use('/auth', authRouter);
adminRouter.use('/language', languageRouter);
adminRouter.use('/currency', currencyRouter);
adminRouter.use('/onboarding', onboardingRouter);
adminRouter.use('/domain', domainRouter);
adminRouter.use('/profile', profileRouter);
adminRouter.use('/report', reportRouter);

export default adminRouter;
