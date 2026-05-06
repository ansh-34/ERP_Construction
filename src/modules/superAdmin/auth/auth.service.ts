import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Messages } from '../../../constants/index.js';
import { SuperAdminRepository } from '../../../repositories/index.js';

export const SuperAdminAuthService = {
  async login(data: { identifier: string; password: string }) {
    const { identifier, password } = data;

    if (!identifier || !password) {
      throw new Error(Messages.AUTH.SUPERADMIN_EMAIL_PASSWORD_REQUIRED);
    }

    const superAdmin = await SuperAdminRepository.findActiveByEmail(identifier);

    if (!superAdmin) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(password, superAdmin.password);

    if (!isMatch) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const token = jwt.sign(
      { id: superAdmin.id, email: superAdmin.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' },
    );
    return token;
  },
};
