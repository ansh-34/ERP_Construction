import { superAdminData } from '@/seed/superAdmin';

export const seedSuperAdminData = async () => {
  try {
    await superAdminData();
  } catch (error) {
    console.log('error', error);
  }
};
