import { seedFullModuleAccessData } from './fullModuleAccess';
import { seedRoleModulePermissionData } from './roleModulePermissionSeeder';
import { seedSuperAdminData } from './superAdminSeeder';
import { initDatabase } from '@infra/database/prisma/prisma.client';

export const runFunctions = async () => {
  try {
    await initDatabase();
    await Promise.all([
      seedRoleModulePermissionData(),
      seedSuperAdminData(),
      seedFullModuleAccessData(),
    ]);
  } catch (error) {
    throw new Error(
      `error while running initialization functions: ${error.message}`,
    );
  }
};
