import { initSuperAdmin } from '@/seed/superAdmin';

export const seedSuperAdminData = async () => {
  try {
    await initSuperAdmin();
  } catch (error) {
    console.log('error', error);
  }
};
