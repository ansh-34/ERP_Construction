import { Messages } from '../../../constants/index.js';
import { RawMaterialPurchaseRequestRepository } from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import {
  ApprovalStatus,
  PurchaseRequestType,
} from '../../../infra/database/prisma/generated/prisma/client/enums.js';
import prisma from '../../../infra/database/prisma/prisma.client.js';

const editableStatuses: ApprovalStatus[] = [
  ApprovalStatus.PENDING,
  ApprovalStatus.REJECTED,
];

const ensureBodyIdentityMatchesAuth = (
  authDomainId: string,
  authUserId: string,
  data: { domainId?: string; requestedBy?: string },
) => {
  if (data.domainId && data.domainId !== authDomainId) {
    throw new Error('domainId does not match authenticated domain');
  }
  if (data.requestedBy && data.requestedBy !== authUserId) {
    throw new Error('requestedBy does not match authenticated user');
  }
};

const ensureRelationsBelongToDomain = async (
  domainId: string,
  data: {
    productId?: string;
    productGradeId?: string;
    uomId?: string;
    projectId?: string;
  },
) => {
  if (data.productId) {
    const product = await prisma.product.findFirst({
      where: { id: data.productId, domainId, isDeleted: false },
    });
    if (!product) throw new Error(Messages.INVENTORY.PRODUCT_NOT_FOUND);
  }

  if (data.productGradeId) {
    const grade = await prisma.productGrades.findFirst({
      where: {
        id: data.productGradeId,
        ...(data.productId ? { productId: data.productId } : {}),
        domainId,
        isDeleted: false,
      },
    });
    if (!grade) throw new Error(Messages.INVENTORY.GRADE_NOT_FOUND);
  }

  if (data.uomId) {
    const uom = await prisma.uom.findFirst({
      where: { id: data.uomId, domainId, isDeleted: false },
    });
    if (!uom) throw new Error(Messages.INVENTORY.UOM_NOT_FOUND);
  }

  if (data.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, domainId, isDeleted: false },
    });
    if (!project) throw new Error('Project not found');
  }
};

export const RawMaterialPurchaseRequestService = {
  generateCode(domainId: string): string {
    const timestamp = Date.now();
    const suffix = domainId.slice(0, 4).toUpperCase();
    return `RMPR-${suffix}-${timestamp}`;
  },

  generatePoCode(domainId: string): string {
    const timestamp = Date.now();
    const suffix = domainId.slice(0, 4).toUpperCase();
    return `PO-${suffix}-${timestamp}`;
  },

  async createRequest(
    domainId: string,
    requestedBy: string,
    data: {
      type: PurchaseRequestType;
      productId: string;
      productGradeId: string;
      quantity: number;
      uomId: string;
      vendor?: string;
      brand?: string;
      requisitionRequestDocumentUrl?: string;
      requiredBy: string;
      reason: string;
      projectId: string;
      domainId?: string;
      requestedBy?: string;
    },
  ) {
    ensureBodyIdentityMatchesAuth(domainId, requestedBy, data);
    await ensureRelationsBelongToDomain(domainId, data);

    const code = RawMaterialPurchaseRequestService.generateCode(domainId);
    const {
      domainId: _bodyDomainId,
      requestedBy: _bodyRequestedBy,
      ...payload
    } = data;

    return RawMaterialPurchaseRequestRepository.create({
      ...payload,
      code,
      requiredBy: new Date(data.requiredBy),
      requestedBy,
      domainId,
      approvalStatus: ApprovalStatus.PENDING,
      status: 'ACTIVE',
      isDeleted: false,
    });
  },

  async listRequests(
    authDomainId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: string;
      searchKey?: string;
      type?: string;
      approvalStatus?: string;
      productId?: string;
      projectId?: string;
      domainId?: string;
      isDeleted?: boolean;
      [key: string]: any;
    },
  ) {
    if (query.domainId && query.domainId !== authDomainId) {
      throw new Error('domainId does not match authenticated domain');
    }

    const { offset, limit } = normalizePagination(query);

    const [totalCount, requests] =
      await RawMaterialPurchaseRequestRepository.listByDomain(
        authDomainId,
        limit,
        offset,
        {
          status: query.status,
          searchKey: query.searchKey,
          type: query.type,
          approvalStatus: query.approvalStatus,
          productId: query.productId,
          projectId: query.projectId,
          isDeleted: query.isDeleted ?? false,
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

    if (!editableStatuses.includes(request.approvalStatus)) {
      throw new Error(
        'Only pending or rejected purchase requests can be updated',
      );
    }

    const relationData = {
      productId: data.productId ?? request.productId,
      productGradeId: data.productGradeId ?? request.productGradeId,
      uomId: data.uomId ?? request.uomId,
      projectId: data.projectId ?? request.projectId,
    };
    await ensureRelationsBelongToDomain(domainId, relationData);

    return RawMaterialPurchaseRequestRepository.update(id, {
      ...data,
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

    if (request.approvalStatus === ApprovalStatus.APPROVED) {
      throw new Error('Approved purchase requests cannot be deleted');
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

    if (approvalStatus === ApprovalStatus.REJECTED) {
      if (request.approvalStatus === ApprovalStatus.APPROVED) {
        throw new Error('Approved purchase requests cannot be rejected');
      }

      return RawMaterialPurchaseRequestRepository.update(id, {
        approvalStatus: ApprovalStatus.REJECTED,
        approvedAt: null,
      });
    }

    if (!editableStatuses.includes(request.approvalStatus)) {
      throw new Error(Messages.RAW_MATERIAL_PURCHASE_REQUEST.ALREADY_ACTIONED);
    }

    const poCode = RawMaterialPurchaseRequestService.generatePoCode(domainId);
    return RawMaterialPurchaseRequestRepository.approveAndCreatePO(
      id,
      domainId,
      poCode,
    );
  },

  async approveOrRejectRequests(
    domainId: string,
    ids: string | string[],
    approvalStatus: ApprovalStatus,
  ) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    const results = [];

    for (const id of idArray) {
      results.push(
        await this.approveOrRejectRequest(domainId, id, approvalStatus),
      );
    }

    return { count: results.length, results };
  },

  // --- Purchase Order Methods ---

  async listPurchaseOrders(
    authDomainId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: string;
      orderStatus?: string;
      projectId?: string;
      domainId?: string;
      isDeleted?: boolean;
    },
  ) {
    if (query.domainId && query.domainId !== authDomainId) {
      throw new Error('domainId does not match authenticated domain');
    }

    const { offset, limit } = normalizePagination(query);

    const [totalCount, purchaseOrders] =
      await RawMaterialPurchaseRequestRepository.listPurchaseOrders(
        authDomainId,
        limit,
        offset,
        {
          status: query.status,
          orderStatus: query.orderStatus,
          projectId: query.projectId,
          isDeleted: query.isDeleted,
        },
      );

    return {
      purchaseOrders,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async getPurchaseOrderById(domainId: string, poId: string) {
    const po = await RawMaterialPurchaseRequestRepository.getPurchaseOrderById(
      poId,
      domainId,
    );
    if (!po) {
      throw new Error(Messages.PURCHASE_ORDER.NOT_FOUND);
    }
    return po;
  },

  // async updatePurchaseOrder(domainId: string, poId: string, data: any) {
  //   const po = await RawMaterialPurchaseRequestRepository.getPurchaseOrderById(
  //     poId,
  //     domainId,
  //   );
  //   if (!po) {
  //     throw new Error(Messages.PURCHASE_ORDER.NOT_FOUND);
  //   }

  //   if (po.orderStatus === 'CANCELLED') {
  //     throw new Error(Messages.PURCHASE_ORDER.CANNOT_UPDATE_CANCELLED);
  //   }

  //   return RawMaterialPurchaseRequestRepository.updatePurchaseOrder(poId, data);
  // },

  // // --- Purchase Order Product Methods ---

  // async createPoProduct(domainId: string, poId: string, data: any) {
  //   const po = await RawMaterialPurchaseRequestRepository.getPurchaseOrderById(
  //     poId,
  //     domainId,
  //   );
  //   if (!po) {
  //     throw new Error(Messages.PURCHASE_ORDER.NOT_FOUND);
  //   }

  //   if (po.orderStatus === 'CANCELLED') {
  //     throw new Error(Messages.PURCHASE_ORDER.CANNOT_UPDATE_CANCELLED);
  //   }

  //   const productData = {
  //     ...data,
  //     purchaseOrderId: po.id,
  //     orderCode: po.code,
  //     projectId: po.projectId,
  //     domainId: po.domainId,
  //     status: 'ACTIVE',
  //     isDeleted: false,
  //   };

  //   return RawMaterialPurchaseRequestRepository.createPoProduct(
  //     poId,
  //     domainId,
  //     productData,
  //   );
  // },

  async listPoProducts(domainId: string, poId: string) {
    const po = await RawMaterialPurchaseRequestRepository.getPurchaseOrderById(
      poId,
      domainId,
    );
    if (!po) {
      throw new Error(Messages.PURCHASE_ORDER.NOT_FOUND);
    }

    return RawMaterialPurchaseRequestRepository.listPoProducts(poId, domainId);
  },

  // async updatePoProduct(domainId: string, poId: string, productId: string, data: any) {
  //   const po = await RawMaterialPurchaseRequestRepository.getPurchaseOrderById(
  //     poId,
  //     domainId,
  //   );
  //   if (!po) {
  //     throw new Error(Messages.PURCHASE_ORDER.NOT_FOUND);
  //   }

  //   if (po.orderStatus === 'CANCELLED') {
  //     throw new Error(Messages.PURCHASE_ORDER.CANNOT_UPDATE_CANCELLED);
  //   }

  //   const product = await RawMaterialPurchaseRequestRepository.getPoProductById(
  //     productId,
  //     poId,
  //     domainId,
  //   );
  //   if (!product) {
  //     throw new Error('Purchase order product not found');
  //   }

  //   return RawMaterialPurchaseRequestRepository.updatePoProduct(
  //     productId,
  //     poId,
  //     domainId,
  //     data,
  //   );
  // },

  // async deletePoProduct(domainId: string, poId: string, productId: string) {
  //   const po = await RawMaterialPurchaseRequestRepository.getPurchaseOrderById(
  //     poId,
  //     domainId,
  //   );
  //   if (!po) {
  //     throw new Error(Messages.PURCHASE_ORDER.NOT_FOUND);
  //   }

  //   if (po.orderStatus === 'CANCELLED') {
  //     throw new Error(Messages.PURCHASE_ORDER.CANNOT_UPDATE_CANCELLED);
  //   }

  //   const product = await RawMaterialPurchaseRequestRepository.getPoProductById(
  //     productId,
  //     poId,
  //     domainId,
  //   );
  //   if (!product) {
  //     throw new Error('Purchase order product not found');
  //   }

  //   return RawMaterialPurchaseRequestRepository.deletePoProduct(
  //     productId,
  //     poId,
  //     domainId,
  //   );
  // },
};
