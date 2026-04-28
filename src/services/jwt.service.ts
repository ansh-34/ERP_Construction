import * as jwt from 'jsonwebtoken';
import { variables } from '@config/index';

export const encode = (data) => {
  return jwt.sign(data, variables.JWT_SECRET);
};
