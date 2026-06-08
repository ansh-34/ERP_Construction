import { SuperAdminRepository } from '../../../repositories/index.js';

export const SuperAdminProfileService = {
  async getProfile(userInfo: { userId: string }) {
    const superAdmin = await SuperAdminRepository.findActiveByIdWithSelect(
      userInfo.userId,
      {
        id: true,
        email: true,
      },
    );
    return {
      user: {
        id: superAdmin?.id,
        name: 'Superadmin',
        email: superAdmin?.email,
        role: 'SUPERADMIN',
      },
    };
  },
};
