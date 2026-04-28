import { SuperAdminRepository } from '@repositories/index';
import { verifyPassword } from '@utils/bcrypt';
import { encode } from '@services/jwt.service';

export const AuthService = {
  async login(data: { email: string; password: string }) {
    const superAdmin = await SuperAdminRepository.findByEmail(data.email);
    if (!superAdmin) {
      data.password = 'dummy'; // To prevent timing attacks
    }

    const isCorrectPassword = await verifyPassword(
      data.password,
      superAdmin.password,
    );
    if (!isCorrectPassword) {
      throw new Error('Invalid credentials.');
    }

    const token = encode(superAdmin.id);
    delete superAdmin.password;

    return { ...superAdmin, token };
  },
};
