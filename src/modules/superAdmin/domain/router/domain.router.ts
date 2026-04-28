import { Router } from 'express';
import passport from 'passport';

import {
  addDomain,
  updateDomain,
  getDomain,
  removeDomain,
  listDomains,
} from '../controller/domain.controller';
import { validate } from '@/middlewares/validate';
import {
  add,
  edit,
  editData,
  list,
  get,
  remove,
} from '../validator/domain.validator';

export const domainRouter = Router();

domainRouter.post(
  '/',
  passport.authenticate('superAdmin', { session: false }),
  validate(add, 'body'),
  addDomain,
);

domainRouter.put(
  '/:id',
  passport.authenticate('superAdmin', { session: false }),
  validate(edit, 'params'),
  validate(editData, 'body'),
  updateDomain,
);

domainRouter.get(
  '/',
  passport.authenticate('superAdmin', { session: false }),
  validate(list, 'query'),
  listDomains,
);

domainRouter.get(
  '/:id',
  passport.authenticate('superAdmin', { session: false }),
  validate(get, 'params'),
  getDomain,
);

domainRouter.delete(
  '/:id',
  passport.authenticate('superAdmin', { session: false }),
  validate(remove, 'params'),
  removeDomain,
);

export default domainRouter;
