import { HealthPaths } from './health.paths.js';
import { SuperAdminPaths } from './superAdmin.paths.js';
import { DomainPaths } from './domain.paths.js';
import { UserPaths } from './user.paths.js';
import { RolePaths } from './role.paths.js';
import { LanguagePaths } from './language.paths.js';
import { VehiclePaths } from './vehicle.paths.js';
import { InventoryPaths } from './inventory.paths.js';
import { JourneySchedulePaths } from './journeySchedule.paths.js';
import { DispatchPaths } from './dispatch.paths.js';
import { AppErrorPaths } from './appError.paths.js';
import { ModulePaths } from './module.paths.js';
import { PermissionPaths } from './permission.paths.js';
import { ModuleDependencyPaths } from './moduleDependency.paths.js';
import { ModulePermissionPaths } from './modulePermission.paths.js';
import { ProductPaths } from './product.paths.js';
import { UomPaths } from './uom.paths.js';

export const ApiPaths = {
  ...HealthPaths,
  ...SuperAdminPaths,
  ...DomainPaths,
  ...UserPaths,
  ...RolePaths,
  ...LanguagePaths,
  ...VehiclePaths,
  ...InventoryPaths,
  ...JourneySchedulePaths,
  ...DispatchPaths,
  ...AppErrorPaths,
  ...ModulePaths,
  ...PermissionPaths,
  ...ModuleDependencyPaths,
  ...ModulePermissionPaths,
  ...ProductPaths,
  ...UomPaths,
};
