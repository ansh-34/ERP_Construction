import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import isDomain from '../../../middlewares/isDomain.js';
import { getProfile } from './profile.controller.js';

const router = Router();

router.get('/', authMiddleware, isDomain, getProfile);

export default router;
