import { Router } from 'express';
import validateSuperAdmin from '../../../middlewares/validateSuperAdmin.js';
import { getProfile } from './profile.controller.js';

const router = Router();

router.get('/', validateSuperAdmin, getProfile);

export default router;
