import { StatusEnum } from '@constants/index.js';
import {
  UserRepository,
  RoleRepository,
  projectRepository,
  InventoryRepository,
  RawMaterialPurchaseRequestRepository,
  invoiceRepository,
  GrnRepository,
  projectTaskRepository,
  VehicleRepository,
  maintenanceScheduleRepository,
  machineryRepository,
} from '../../../repositories/index.js';

export const DashboardService = {
  async getDashboardAnalytics(domainId: string, langCode: string) {
    const [
      onboardedUserCount,
      onboardingInProgessUserCount,
      invitedUserCount,
      roleCount,
      projectCompletedCount,
      projectInProgessCount,
      projectPendingCount,
      totalInventoryCount,
      lowStockCount,
      topFiveBiggestProjects,
      totalPurchaseRequestCount,
      totalApprovedPurchaseRequestCount,
      totalPurchaseOrderCount,
      totalApprovedPurchaseOrderCount,
      totalGrnCount,
      totalApprovedGrnCount,
      totalPendingProjectTaskCount,
      totalInProgressProjectTaskCount,
      totalCompletedProjectTaskCount,
      totalApprovedProjectTaskCount,
      totalVehiclesCount,
      totalMachineriesCount,
      upcomingMaintenanceSchedule,
    ] = await Promise.all([
      UserRepository.count({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
          onboardingStatus: 'COMPLETED',
        },
      }),
      UserRepository.count({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
          onboardingStatus: 'INPROGRESS',
        },
      }),
      UserRepository.count({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
          onboardingStatus: 'PENDING',
        },
      }),
      RoleRepository.count({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
        },
      }),
      projectRepository.count({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
          actualStartDate: {
            not: null,
          },
          actualEndDate: {
            not: null,
          },
        },
      }),
      projectRepository.count({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
          actualStartDate: {
            not: null,
          },
          actualEndDate: null,
        },
      }),
      projectRepository.count({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
          actualStartDate: null,
          actualEndDate: null,
        },
      }),
      InventoryRepository.count({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
        },
      }),
      InventoryRepository.count({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
          lowStock: true,
        },
      }),
      projectRepository.find({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
        },
        orderBy: {
          budget: 'desc',
        },
        select: {
          name: true,
          code: true,
          budget: true,
          spent: true,
          status: true,
        },
        limit: 5,
        offset: 0,
      }),
      RawMaterialPurchaseRequestRepository.countByOptions({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
        },
      }),
      RawMaterialPurchaseRequestRepository.countByOptions({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
          approvalStatus: 'APPROVED',
        },
      }),
      RawMaterialPurchaseRequestRepository.countPurchaseOrders({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
        },
      }),
      invoiceRepository.count({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
        },
      }),
      GrnRepository.count({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
        },
      }),
      GrnRepository.count({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
          approvalStatus: 'APPROVED',
        },
      }),
      projectTaskRepository.count({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
          projectTaskStatus: 'PENDING',
        },
      }),
      projectTaskRepository.count({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
          projectTaskStatus: 'IN_PROGRESS',
        },
      }),
      projectTaskRepository.count({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
          projectTaskStatus: 'COMPLETED',
        },
      }),
      projectTaskRepository.count({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
          projectTaskStatus: 'APPROVED',
        },
      }),
      VehicleRepository.count({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
        },
      }),
      machineryRepository.countByOptions({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
        },
      }),
      maintenanceScheduleRepository.find({
        filters: {
          domainId,
          status: StatusEnum.ACTIVE,
          fromDate: new Date(),
        },
        orderBy: {
          nextDueDate: 'asc',
        },
        select: {
          code: true,
          title: true,
          assetType: true,
          nextDueDate: true,
        },
      }),
    ]);

    const totalProjectTaskCount =
      totalPendingProjectTaskCount +
      totalInProgressProjectTaskCount +
      totalCompletedProjectTaskCount;

    const localizedTopFiveProjectsSpentData = topFiveBiggestProjects.map(
      (project: any) => ({
        ...project,
        name: project.name?.[langCode] ?? project.name?.en ?? '',
      }),
    );

    const localizedUpcomingSchedules = upcomingMaintenanceSchedule.map(
      (schedule: any) => ({
        ...schedule,
        title: schedule.title?.[langCode] ?? schedule.title?.en ?? '',
      }),
    );

    return {
      analytics: {
        platformUsers: {
          onboarded: onboardedUserCount,
          onboardingInProgress: onboardingInProgessUserCount,
          invited: invitedUserCount,
        },
        roleCount,
        project: {
          completed: projectCompletedCount,
          inprogress: projectInProgessCount,
          pending: projectPendingCount,
        },
        inventory: {
          total: totalInventoryCount,
          lowStock: lowStockCount,
        },
      },
      topFiveProjectsSpentData: localizedTopFiveProjectsSpentData,
      approvalPipelineData: {
        rawMaterialPurchaseRequest: {
          total: totalPurchaseRequestCount,
          approved: totalApprovedPurchaseRequestCount,
        },
        purchaseOrder: {
          total: totalPurchaseOrderCount,
          approved: totalApprovedPurchaseOrderCount,
        },
        grn: {
          total: totalGrnCount,
          approved: totalApprovedGrnCount,
        },
      },
      taskPerformanceData: {
        total: totalProjectTaskCount,
        pending: totalPendingProjectTaskCount,
        inProgress: totalInProgressProjectTaskCount,
        completed: totalCompletedProjectTaskCount,
        approved: totalApprovedProjectTaskCount,
        completionPercentage:
          totalProjectTaskCount === 0
            ? 0
            : Number(
                (
                  (totalCompletedProjectTaskCount / totalProjectTaskCount) *
                  100
                ).toFixed(2),
              ),
        approvedAndCompletedPercentage:
          totalProjectTaskCount === 0
            ? 0
            : Number(
                (
                  (totalApprovedProjectTaskCount / totalProjectTaskCount) *
                  100
                ).toFixed(2),
              ),
        completionEfficiency:
          totalProjectTaskCount === 0
            ? 0
            : Number(
                (
                  (totalCompletedProjectTaskCount / totalProjectTaskCount) *
                  100
                ).toFixed(2),
              ),
      },
      VehiclesAndMachinery: {
        totalVehicles: totalVehiclesCount,
        totalMachineries: totalMachineriesCount,
      },
      upcomingMaintenanceSchedule: localizedUpcomingSchedules,
    };
  },
};
