import { SuperAdminRepository } from '@repositories/index';
import { verifyPassword } from '@utils/bcrypt';
import { encode } from '@services/jwt.service';

const DUMMY_PASSWORD_HASH =
  '$2b$10$Q3m14GH534WOi4jXGiMIJ.B.cwGMQAJa/uzqXObr9b8t1qm1kC6Fq';

export const AuthService = {
  async login(data: { email: string; password: string }) {
    const superAdmin = await SuperAdminRepository.findByEmail(data.email);

    const isCorrectPassword = await verifyPassword(
      data.password,
      superAdmin?.password ?? DUMMY_PASSWORD_HASH,
    );
    if (!superAdmin || !isCorrectPassword) {
      throw new Error('Invalid credentials.');
    }

    const token = encode(superAdmin.id);
    const { password, ...safeSuperAdmin } = superAdmin;

    return { ...safeSuperAdmin, token };
  },
};
