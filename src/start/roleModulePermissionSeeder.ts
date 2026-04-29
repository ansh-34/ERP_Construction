import { permissionData } from '@/seed/permission';

export const seedRoleModulePermissionData = async () => {
  try {
    await permissionData();
  } catch (error) {
    console.log('error', error);
  }
};
