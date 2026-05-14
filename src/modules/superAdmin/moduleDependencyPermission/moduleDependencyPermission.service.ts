import { Messages } from '../../../constants/index.js';
import {
  ModuleDependencyPermissionRepository,
  ModuleDependencyRepository,
  ModulePermissionRepository,
} from '../../../repositories/index.js';

export const ModuleDependencyPermissionService = {
  async createModuleDependencyPermission(data: {
    moduleDependencyId: string;
    permissionIds: string[];
  }) {
    const { moduleDependencyId, permissionIds } = data;

    const validModuleDependency =
      await ModuleDependencyRepository.findById(moduleDependencyId);

    if (!validModuleDependency) {
      throw new Error(Messages.MODULE_DEPENDENCY.NOT_FOUND);
    }

    const validDependencyPermissions =
      await ModulePermissionRepository.validateModulesPermissions(
        permissionIds.map((id) => ({
          moduleId: validModuleDependency.dependentModuleId,
          permissionId: id,
        })),
      );

    if (!validDependencyPermissions) {
      throw new Error(Messages.MODULE_DEPENDENCY.INVALID_PERMISSIONS);
    }

    return await ModuleDependencyPermissionRepository.bulkCreate(
      permissionIds.map((permissionId) => ({
        moduleDependencyId,
        permissionId,
      })),
    );
  },

  async deleteModuleDependencyPermission(id: string) {
    const dependencyPermission =
      await ModuleDependencyPermissionRepository.findById(id);

    if (!dependencyPermission) {
      throw new Error(Messages.MODULE_DEPENDENCY.NOT_FOUND);
    }

    await ModuleDependencyPermissionRepository.softDelete(id);
  },
};
