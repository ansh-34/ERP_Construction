import { AdminRepository } from '../../../repositories/admin.repository.js';

export const AdminProfileService = {
  async getProfile(adminId: string) {
    const admin = await AdminRepository.findActiveById(adminId, {
      select: {
        id: true,
        name: true,
        email: true,
        phoneCode: true,
        phone: true,
        isEmailVerified: true,
        status: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        domains: {
          where: { isDeleted: false },
          select: {
            id: true,
            name: true,
            email: true,
            industry: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!admin) {
      throw new Error('Admin profile not found');
    }

    return {
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phoneCode: admin.phoneCode,
        phone: admin.phone,
        role: 'ADMIN',
        isEmailVerified: admin.isEmailVerified,
        status: admin.status,
        isDeleted: admin.isDeleted,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
      domains: admin.domains,
    };
  },
};
