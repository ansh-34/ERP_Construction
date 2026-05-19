import { Router } from 'express';
import { listLogs } from './logs.controller.js';
import validateSuperAdmin from '../../../middlewares/validateSuperAdmin.js';

const router = Router();

router.get('/', validateSuperAdmin, listLogs); // list api

export default router;
