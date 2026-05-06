import { Router } from 'express';
import validateSuperAdmin from '../../../middlewares/validateSuperAdmin.js';
import { getProfile } from './profile.controller.js';

const router = Router();

router.use(validateSuperAdmin);

router.get('/', getProfile);

export default router;
