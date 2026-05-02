import { Router } from 'express';

import appErrorRouter from './appError/appError.router.js';
import authRouter from './auth/auth.router.js';
import dispatchRouter from './dispatch/dispatch.router.js';
import inventoryRouter from './inventory/inventory.router.js';
import journeyScheduleRouter from './journeySchedule/journeySchedule.router.js';
import languageRouter from './language/language.router.js';
import roleRouter from './role/role.router.js';
import userRouter from './user/user.router.js';
import vehicleRouter from './vehicle/vehicle.router.js';
import productRouter from './product/product.router.js';

const domainRouter = Router();

domainRouter.use('/auth', authRouter);
domainRouter.use('/roles', roleRouter);
domainRouter.use('/users', userRouter);
domainRouter.use('/inventory', inventoryRouter);
domainRouter.use('/app-errors', appErrorRouter);
domainRouter.use('/language', languageRouter);
domainRouter.use('/vehicles', vehicleRouter);
domainRouter.use('/journey-schedules', journeyScheduleRouter);
domainRouter.use('/dispatch', dispatchRouter);
domainRouter.use('/products', productRouter);

export default domainRouter;
