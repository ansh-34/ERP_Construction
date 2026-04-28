import { Router } from 'express';
import passport from 'passport';

import {
  addModule,
  editModule,
  listModules,
  removeModule,
} from '../controller/module.controller';
import { validate } from '@/middlewares/validate';
import {
  add,
  edit,
  editData,
  list,
  remove,
} from '../validator/module.validator';

export const moduleRouter = Router();

// Swagger

/**
 * @openapi
 * /api/superAdmin/module:
 *   post:
 *     tags:
 *       - Module
 *     summary: Add Module
 *     security:
 *       - superAdmin: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Module'
 *     responses:
 *       200:
 *         description: Module added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 */

/**
 * @openapi
 * /api/superAdmin/module/{id}:
 *   put:
 *     tags:
 *       - Module
 *     summary: Edit Module
 *     security:
 *       - superAdmin: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Module'
 *     responses:
 *       200:
 *         description: Module edited successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 */

/**
 * @openapi
 * /api/superAdmin/module/{id}:
 *   get:
 *     tags:
 *       - Module
 *     summary: Get Module
 *     security:
 *       - superAdmin: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Module fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 */

/**
 * @openapi
 * /api/superAdmin/module/{id}:
 *   delete:
 *     tags:
 *       - Module
 *     summary: Delete Module
 *     security:
 *       - superAdmin: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Module deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 */

moduleRouter.post(
  '/',
  passport.authenticate('superAdmin', { session: false }),
  validate(add, 'body'),
  addModule,
);

moduleRouter.put(
  '/:id',
  passport.authenticate('superAdmin', { session: false }),
  validate(edit, 'params'),
  validate(editData, 'body'),
  editModule,
);

moduleRouter.get(
  '/:id',
  passport.authenticate('superAdmin', { session: false }),
  validate(list, 'params'),
  listModules,
);

moduleRouter.delete(
  '/:id',
  passport.authenticate('superAdmin', { session: false }),
  validate(remove, 'params'),
  removeModule,
);

export default moduleRouter;
