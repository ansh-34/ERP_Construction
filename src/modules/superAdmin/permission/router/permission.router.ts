import { Router } from 'express';
import passport from 'passport';

import {
  addPermission,
  editPermission,
  listPermissions,
  removePermission,
} from '../controller/permission.controller';
import { validate } from '@/middlewares/validate';
import {
  add,
  edit,
  editData,
  list,
  remove,
} from '../validator/permission.validator';

export const permissionRouter = Router();

permissionRouter.post(
  '/',
  passport.authenticate('superAdmin', { session: false }),
  validate(add, 'body'),
  addPermission,
);

permissionRouter.put(
  '/:id',
  passport.authenticate('superAdmin', { session: false }),
  validate(edit, 'params'),
  validate(editData, 'body'),
  editPermission,
);

permissionRouter.get(
  '/:id',
  passport.authenticate('superAdmin', { session: false }),
  validate(list, 'params'),
  listPermissions,
);

permissionRouter.delete(
  '/:id',
  passport.authenticate('superAdmin', { session: false }),
  validate(remove, 'params'),
  removePermission,
);

export default permissionRouter;
