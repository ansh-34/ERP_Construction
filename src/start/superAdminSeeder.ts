import { initSuperadmin } from '@/seed/superAdmin';

export const seedSuperAdminData = async () => {
  try {
    await initSuperadmin();
  } catch (error) {
    console.log('error', error);
  }
};
