import { Messages } from '../../../constants/index.js';
import { RawMaterialPurchaseRequestRepository } from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import {
  ApprovalStatus,
  PurchaseRequestType,
} from '../../../infra/database/prisma/generated/prisma/client/enums.js';
import prisma from '../../../infra/database/prisma/prisma.client.js';

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
    const product = await prisma.product.findFirst({
      where: { id: data.productId, domainId, isDeleted: false },
    });
    if (!product) {
      throw new Error(Messages.INVENTORY.PRODUCT_NOT_FOUND);
    }

    const grade = await prisma.productGrades.findFirst({
      where: {
        id: data.productGradeId,
        productId: data.productId,
        domainId,
        isDeleted: false,
      },
    });
    if (!grade) {
      throw new Error(Messages.INVENTORY.GRADE_NOT_FOUND);
    }

    const uom = await prisma.uom.findFirst({
      where: { id: data.uomId, domainId, isDeleted: false },
    });
    if (!uom) {
      throw new Error(Messages.INVENTORY.UOM_NOT_FOUND);
    }

    const project = await prisma.project.findFirst({
      where: { id: data.projectId, domainId, isDeleted: false },
    });
    if (!project) {
      throw new Error(Messages.RAW_MATERIAL_PURCHASE_REQUEST.NOT_FOUND);
    }

    const code = RawMaterialPurchaseRequestService.generateCode(domainId);

    return RawMaterialPurchaseRequestRepository.create({
      ...data,
      code,
      // date: new Date(data.date),
      ...(data.requiredBy ? { requiredBy: new Date(data.requiredBy) } : {}),
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

  async listApprovedRequests(domainId: string, query: any) {
    return this.listRequests(domainId, {
      ...query,
      approvalStatus: ApprovalStatus.APPROVED,
    });
  },

  async listApprovedRequestsByProduct(
    domainId: string,
    productId: string,
    query: any,
  ) {
    return this.listRequests(domainId, {
      ...query,
      approvalStatus: ApprovalStatus.APPROVED,
      productId,
    });
  },

  async approveOrRejectRequests(
    domainId: string,
    ids: string | string[],
    approvalStatus: ApprovalStatus,
  ) {
    // Normalize single id to array
    const idArray = Array.isArray(ids) ? ids : [ids];

    // Validate each request exists, belongs to domain, and is still PENDING
    for (const id of idArray) {
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
          Messages.RAW_MATERIAL_PURCHASE_REQUEST.ALREADY_ACTIONED,
        );
      }
    }

    if (approvalStatus === ApprovalStatus.APPROVED) {
      const timestamp = Date.now();
      const suffix = domainId.slice(0, 4).toUpperCase();
      const poCode = `PO-${suffix}-${timestamp}`;

      return RawMaterialPurchaseRequestRepository.approveAndCreatePO(
        idArray,
        domainId,
        poCode,
      );
    }

    return RawMaterialPurchaseRequestRepository.bulkUpdateApproval(
      idArray,
      approvalStatus,
      domainId,
    );
  },
};
