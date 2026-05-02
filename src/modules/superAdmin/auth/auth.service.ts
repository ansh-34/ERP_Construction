import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Messages } from '../../../constants/index.js';
import { SuperAdminRepository } from '../../../repositories/index.js';

export const SuperAdminAuthService = {
  async login(data: { superAdminEmail: string; superAdminPassword: string }) {
    const { superAdminEmail, superAdminPassword } = data;

    if (!superAdminEmail || !superAdminPassword) {
      throw new Error(Messages.AUTH.SUPERADMIN_EMAIL_PASSWORD_REQUIRED);
    }

    const superAdmin =
      await SuperAdminRepository.findActiveByEmail(superAdminEmail);

    if (!superAdmin) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(
      superAdminPassword,
      superAdmin.password,
    );

    if (!isMatch) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    return jwt.sign(
      { id: superAdmin.id, email: superAdmin.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' },
    );
  },
};
