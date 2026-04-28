import { DomainRepository, UserRepository } from '@repositories/index';
import { verifyPassword } from '@utils/bcrypt';
import { encode } from '@services/jwt.service';

export const AuthService = {
  async login(data: { email: string; password: string }) {
    const domain = await DomainRepository.findByEmail(data.email);
    const isCorrectPassword = await verifyPassword(
      data.password,
      domain?.password || 'dummy', // To prevent timing attacks,
    );
    if (!isCorrectPassword || !domain) {
      throw new Error('Invalid credentials.');
    }

    const token = encode(domain.id);
    const domainObj = domain as any;
    delete domainObj.password;

    return { ...domainObj, token };
  },

  async userLogin(data: { email: string; password: string }) {
    const user = await UserRepository.findByEmailOnly(data.email);
    const isCorrectPassword = await verifyPassword(
      data.password,
      user?.password || 'dummy',
    );
    if (!isCorrectPassword || !user) {
      throw new Error('Invalid credentials.');
    }

    const token = encode(user.id);
    const userObj = user as any;
    delete userObj.password;

    return { ...userObj, token };
  },
};
