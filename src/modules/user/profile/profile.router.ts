import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import { getProfile } from './profile.controller.js';

const router = Router();

router.get('/', authMiddleware, getProfile);

export default router;
