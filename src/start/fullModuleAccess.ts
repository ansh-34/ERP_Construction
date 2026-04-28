import { giveFullAdminAccess } from '@/seed/adminPermission';

export const seedFullModuleAccessData = async () => {
  try {
    await giveFullAdminAccess();
  } catch (error) {
    console.log('error', error);
  }
};
