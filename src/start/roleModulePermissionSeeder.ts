import { roleData } from '@/seed/role';
import { permissionData } from '@/seed/permission';
import { moduleData } from '@/seed/module';

export const seedRoleModulePermissionData = async () => {
  try {
    await roleData();
    await permissionData();
    await moduleData();
  } catch (error) {
    console.log('error', error);
  }
};
