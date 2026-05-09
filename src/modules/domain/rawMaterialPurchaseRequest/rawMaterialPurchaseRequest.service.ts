import { Messages } from '../../../constants/index.js';
import { RawMaterialPurchaseRequestRepository } from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import {
  ApprovalStatus,
  PurchaseRequestType,
} from '../../../infra/database/prisma/generated/prisma/client/enums.js';

export const RawMaterialPurchaseRequestService = {
  generateCode(domainId: string): string {
    const timestamp = Date.now();
    const suffix = domainId.slice(0, 4).toUpperCase();
    return `RMPR-${suffix}-${timestamp}`;
  },

  async createRequest(
    domainId: string,
    requestedBy: string,
    data: {
      // date: string;
      type: PurchaseRequestType;
      productId: string;
      productGradeId: string;
      quantity: number;
      uomId: string;
      vendor?: string;
      brand?: string;
      requisitionRequestDocumentUrl?: string;
      requiredBy?: string;
      reason: string;
      projectId: string;
    },
  ) {
    const code = RawMaterialPurchaseRequestService.generateCode(domainId);

    return RawMaterialPurchaseRequestRepository.create({
      ...data,
      code,
      // date: new Date(data.date),
      requestedBy,
      domainId,
    });
  },

  async listRequests(
    domainId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: string;
      searchKey?: string;
      type?: string;
      approvalStatus?: string;
      productId?: string;
      projectId?: string;
      [key: string]: any;
    },
  ) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, requests] =
      await RawMaterialPurchaseRequestRepository.listByDomain(
        domainId,
        limit,
        offset,
        {
          status: query.status,
          searchKey: query.searchKey,
          type: query.type,
          approvalStatus: query.approvalStatus,
          productId: query.productId,
          projectId: query.projectId,
        },
      );

    return {
      requests,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async getRequestById(domainId: string, id: string) {
    const request =
      await RawMaterialPurchaseRequestRepository.findByIdWithDetails(
        id,
        domainId,
      );
    if (!request) {
      throw new Error(Messages.RAW_MATERIAL_PURCHASE_REQUEST.NOT_FOUND);
    }
    return request;
  },

  async updateRequest(domainId: string, id: string, data: any) {
    const request =
      await RawMaterialPurchaseRequestRepository.findByIdAndDomain(
        id,
        domainId,
      );
    if (!request) {
      throw new Error(Messages.RAW_MATERIAL_PURCHASE_REQUEST.NOT_FOUND);
    }

    if (request.approvalStatus !== ApprovalStatus.PENDING) {
      throw new Error(
        Messages.RAW_MATERIAL_PURCHASE_REQUEST.CANNOT_UPDATE_NON_PENDING,
      );
    }

    return RawMaterialPurchaseRequestRepository.update(id, {
      ...data,
      // ...(data.date ? { date: new Date(data.date) } : {}),
      ...(data.requiredBy ? { requiredBy: new Date(data.requiredBy) } : {}),
    });
  },

  async deleteRequest(domainId: string, id: string) {
    const request =
      await RawMaterialPurchaseRequestRepository.findByIdAndDomain(
        id,
        domainId,
      );
    if (!request) {
      throw new Error(Messages.RAW_MATERIAL_PURCHASE_REQUEST.NOT_FOUND);
    }

    if (request.approvalStatus !== ApprovalStatus.PENDING) {
      throw new Error(
        Messages.RAW_MATERIAL_PURCHASE_REQUEST.CANNOT_DELETE_NON_PENDING,
      );
    }

    return RawMaterialPurchaseRequestRepository.softDelete(id);
  },

  async approveOrRejectRequest(
    domainId: string,
    id: string,
    approvalStatus: ApprovalStatus,
  ) {
    const request =
      await RawMaterialPurchaseRequestRepository.findByIdAndDomain(
        id,
        domainId,
      );
    if (!request) {
      throw new Error(Messages.RAW_MATERIAL_PURCHASE_REQUEST.NOT_FOUND);
    }

    if (request.approvalStatus !== ApprovalStatus.PENDING) {
      throw new Error(Messages.RAW_MATERIAL_PURCHASE_REQUEST.ALREADY_ACTIONED);
    }

    return RawMaterialPurchaseRequestRepository.update(id, {
      approvalStatus,
      approvedAt: new Date(),
    });
  },
};
