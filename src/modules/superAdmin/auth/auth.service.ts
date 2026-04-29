import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Messages } from '../../../constants/index.js';
import { SuperadminRepository } from '../../../repositories/index.js';

export const SuperAdminAuthService = {
  async login(data: { superadminEmail: string; superadminPassword: string }) {
    const { superadminEmail, superadminPassword } = data;

    if (!superadminEmail || !superadminPassword) {
      throw new Error(Messages.AUTH.SUPERADMIN_EMAIL_PASSWORD_REQUIRED);
    }

    const superadmin =
      await SuperadminRepository.findActiveByEmail(superadminEmail);

    if (!superadmin) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(
      superadminPassword,
      superadmin.password,
    );

    if (!isMatch) {
      throw new Error(Messages.AUTH.INVALID_CREDENTIALS);
    }

    return jwt.sign(
      { id: superadmin.id, email: superadmin.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' },
    );
  },
};
