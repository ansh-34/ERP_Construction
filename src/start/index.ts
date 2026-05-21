import { initSuperAdmin } from '@/seed/superAdmin';
import { permissionData } from '@/seed/permission';
import { moduleData } from '@/seed/module';

export const runFunctions = async () => {
  try {
    await Promise.all([initSuperAdmin(), permissionData(), moduleData()]);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown startup error';
    throw new Error(`error while running initialization functions: ${message}`);
  }
};
