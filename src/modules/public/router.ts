import { Router } from 'express';

import languageRouter from './language/language.router.js';

const publicRouter = Router();

publicRouter.use('/language', languageRouter);

export default publicRouter;
