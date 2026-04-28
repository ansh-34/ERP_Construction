import bcrypt from 'bcryptjs';
import { variables } from '@config/index';

const SALT_ROUNDS = Number(variables.SALT_ROUNDS);

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
