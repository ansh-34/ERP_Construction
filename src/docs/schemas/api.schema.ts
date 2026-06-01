import { CommonSchemas } from './common.schema.js';
import { SuperAdminSchemas } from './superAdmin.schema.js';
import { UserSchemas } from './user.schema.js';
import { RoleSchemas } from './role.schema.js';
import { ModuleSchemas } from './module.schema.js';
import { PermissionSchemas } from './permission.schema.js';
import { RoleModulePermissionSchemas } from './roleModulePermission.schema.js';
import { LanguageSchemas } from './language.schema.js';
import { VehicleSchemas } from './vehicle.schema.js';
import { InventorySchemas } from './inventory.schema.js';
import { JourneyScheduleSchemas } from './journeySchedule.schema.js';
import { DispatchSchemas } from './dispatch.schema.js';
import { AppErrorSchemas } from './appError.schema.js';
import { ProductSchemas } from './product.schema.js';
import { UomSchemas } from './uom.schema.js';
import { RawMaterialPurchaseRequestSchemas } from './rawMaterialPurchaseRequest.schema.js';
import { ProjectSchemas } from './project.schema.js';
import { GrnSchemas } from './grn.schema.js';
import { LogsSchemas } from './logs.schema.js';
import { InvoiceSchemas } from './invoice.schema.js';
import { LocationSchemas } from './location.schema.js';
import { MediaSchemas } from './media.schema.js';
import { VendorProductPriceSchemas } from './vendorProductPrice.schema.js';
import { VendorSchemas } from './vendor.schema.js';
import { MaintenanceLogSchemas } from './maintenanceLog.schema.js';
import { MaintenanceReportSchemas } from './maintenanceReport.schema.js';
import { MaintenanceScheduleSchemas } from './maintenanceSchedule.schema.js';
import { MovementLogSchemas } from './movementLog.schema.js';
import { MovementReportSchemas } from './movementReport.schema.js';

export const ApiSchemas = {
  ...CommonSchemas,
  ...SuperAdminSchemas,
  ...UserSchemas,
  ...RoleSchemas,
  ...ModuleSchemas,
  ...PermissionSchemas,
  ...RoleModulePermissionSchemas,
  ...LanguageSchemas,
  ...VehicleSchemas,
  ...InventorySchemas,
  ...JourneyScheduleSchemas,
  ...DispatchSchemas,
  ...AppErrorSchemas,
  ...ProductSchemas,
  ...UomSchemas,
  ...RawMaterialPurchaseRequestSchemas,
  ...ProjectSchemas,
  ...GrnSchemas,
  ...LogsSchemas,
  ...InvoiceSchemas,
  ...LocationSchemas,
  ...MediaSchemas,
  ...VendorProductPriceSchemas,
  ...VendorSchemas,
  ...MaintenanceLogSchemas,
  ...MaintenanceReportSchemas,
  ...MaintenanceScheduleSchemas,
  ...MovementLogSchemas,
  ...MovementReportSchemas,
};
