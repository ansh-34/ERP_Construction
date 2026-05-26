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

const ensureRelationsBelongToDomain = async (
  domainId: string,
  data: {
    productId?: string;
    productGradeId?: string;
    uomId?: string;
    projectId?: string;
    documentId?: string;
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

  if (data.documentId) {
    const media = await prisma.media.findFirst({
      where: {
        id: data.documentId,
        domainId,
        isDeleted: false,
      },
    });
    if (!media) throw new Error('Document media not found');
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
      projectId: string;
      requiredBy: string;
      reason?: string;
      documentId?: string;
      items: {
        productId: string;
        productGradeId: string;
        quantity: number;
        uomId: string;
        brand?: string;
      }[];
    },
  ) {
    // Validate project & document media
    await ensureRelationsBelongToDomain(domainId, {
      projectId: data.projectId,
      documentId: data.documentId,
    });

    // Validate all items
    for (const item of data.items) {
      await ensureRelationsBelongToDomain(domainId, {
        productId: item.productId,
        productGradeId: item.productGradeId,
        uomId: item.uomId,
      });
    }

    const timestamp = Date.now();
    const suffix = domainId.slice(0, 4).toUpperCase();
    const code = `RMPR-${suffix}-${timestamp}`;

    return prisma.$transaction(async (tx) => {
      const createdRequests = [];

      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];

        const request = await tx.rawMaterialPurchaseRequest.create({
          data: {
            code,
            type: data.type,
            productId: item.productId,
            productGradeId: item.productGradeId,
            quantity: item.quantity,
            uomId: item.uomId,
            brand: item.brand,
            documentId: data.documentId,
            requiredBy: new Date(data.requiredBy),
            reason: data.reason || 'No reason provided',
            projectId: data.projectId,
            requestedBy,
            domainId,
            approvalStatus: ApprovalStatus.PENDING,
            status: 'ACTIVE',
            isDeleted: false,
          },
          include: {
            document: true,
          },
        });

        createdRequests.push(request);
      }

      // Return a unified response structure representing the group
      const first = createdRequests[0];
      return {
        code: first.code,
        type: first.type,
        date: first.date,
        documentId: first.documentId,
        documentUrl: first.document?.url || null,
        document: first.document
          ? {
              id: first.document.id,
              name: first.document.name,
              url: first.document.url,
            }
          : null,
        requestedBy: first.requestedBy,
        requiredBy: first.requiredBy,
        reason: first.reason,
        approvalStatus: first.approvalStatus,
        approvedAt: first.approvedAt,
        projectId: first.projectId,
        domainId: first.domainId,
        status: first.status,
        isDeleted: first.isDeleted,
        createdAt: first.createdAt,
        updatedAt: first.updatedAt,
        purchaseOrderId: first.purchaseOrderId,
        items: createdRequests.map((r) => ({
          id: r.id,
          productId: r.productId,
          productGradeId: r.productGradeId,
          quantity: r.quantity,
          uomId: r.uomId,
          brand: r.brand,
          status: r.status,
          isDeleted: r.isDeleted,
        })),
      };
    });
  },

  async listRequests(
    authDomainId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: 'ACTIVE' | 'INACTIVE';
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

    const whereClause: any = {
      domainId: authDomainId,
      isDeleted: query.isDeleted ?? false,
      ...(query.status ? { status: query.status } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.approvalStatus ? { approvalStatus: query.approvalStatus } : {}),
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.searchKey
        ? {
            OR: [
              { code: { contains: query.searchKey, mode: 'insensitive' } },
              { brand: { contains: query.searchKey, mode: 'insensitive' } },
              { reason: { contains: query.searchKey, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    // Count unique codes
    const uniqueCodesCount = await prisma.rawMaterialPurchaseRequest.groupBy({
      by: ['code'],
      where: whereClause,
    });
    const totalCount = uniqueCodesCount.length;

    // Get paginated unique codes sorted by code desc (newest first because code contains timestamp)
    const distinctRequests = await prisma.rawMaterialPurchaseRequest.findMany({
      where: whereClause,
      distinct: ['code'],
      select: { code: true },
      orderBy: { code: 'desc' },
      take: limit,
      skip: offset,
    });

    const codes = distinctRequests.map((r) => r.code);

    // Fetch all details for these codes
    const allRows = await prisma.rawMaterialPurchaseRequest.findMany({
      where: {
        code: { in: codes },
        domainId: authDomainId,
        isDeleted: query.isDeleted ?? false,
      },
      include: {
        product: true,
        productGrade: true,
        uom: true,
        requestedUser: { select: { id: true, name: true, email: true } },
        project: true,
        purchaseOrder: true,
        document: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const groupedMap = new Map<string, any>();
    for (const row of allRows) {
      if (!groupedMap.has(row.code)) {
        groupedMap.set(row.code, {
          code: row.code,
          type: row.type,
          date: row.date,
          documentId: row.documentId,
          documentUrl: row.document?.url || null,
          document: row.document
            ? {
                id: row.document.id,
                name: row.document.name,
                url: row.document.url,
              }
            : null,
          requestedBy: row.requestedBy,
          requestedUser: row.requestedUser,
          requiredBy: row.requiredBy,
          reason: row.reason,
          approvalStatus: row.approvalStatus,
          approvedAt: row.approvedAt,
          projectId: row.projectId,
          project: row.project,
          domainId: row.domainId,
          status: row.status,
          isDeleted: row.isDeleted,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          purchaseOrderId: row.purchaseOrderId,
          purchaseOrder: row.purchaseOrder,
          items: [],
        });
      }
      groupedMap.get(row.code).items.push({
        id: row.id,
        productId: row.productId,
        product: row.product,
        productGradeId: row.productGradeId,
        productGrade: row.productGrade,
        quantity: row.quantity,
        uomId: row.uomId,
        uom: row.uom,
        brand: row.brand,
        status: row.status,
        isDeleted: row.isDeleted,
      });
    }

    const requests = codes.map((code) => groupedMap.get(code)).filter(Boolean);

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
    const target = await prisma.rawMaterialPurchaseRequest.findFirst({
      where: { id, domainId, isDeleted: false },
      include: {
        product: true,
        productGrade: true,
        uom: true,
        requestedUser: { select: { id: true, name: true, email: true } },
        project: true,
        purchaseOrder: true,
        document: true,
      },
    });
    if (!target) {
      throw new Error(Messages.RAW_MATERIAL_PURCHASE_REQUEST.NOT_FOUND);
    }
    return {
      ...target,
      documentUrl: target.document?.url || null,
    };
  },

  async getRequestByCode(domainId: string, code: string) {
    const siblingRows = await prisma.rawMaterialPurchaseRequest.findMany({
      where: { code, domainId, isDeleted: false },
      include: {
        product: true,
        productGrade: true,
        uom: true,
        requestedUser: { select: { id: true, name: true, email: true } },
        project: true,
        purchaseOrder: true,
        document: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const firstRow = siblingRows[0];
    if (!firstRow) {
      throw new Error(Messages.RAW_MATERIAL_PURCHASE_REQUEST.NOT_FOUND);
    }

    return {
      code: firstRow.code,
      type: firstRow.type,
      date: firstRow.date,
      documentId: firstRow.documentId,
      documentUrl: firstRow.document?.url || null,
      document: firstRow.document
        ? {
            id: firstRow.document.id,
            name: firstRow.document.name,
            url: firstRow.document.url,
          }
        : null,
      requestedBy: firstRow.requestedBy,
      requestedUser: firstRow.requestedUser,
      requiredBy: firstRow.requiredBy,
      reason: firstRow.reason,
      approvalStatus: firstRow.approvalStatus,
      approvedAt: firstRow.approvedAt,
      projectId: firstRow.projectId,
      project: firstRow.project,
      domainId: firstRow.domainId,
      status: firstRow.status,
      isDeleted: firstRow.isDeleted,
      createdAt: firstRow.createdAt,
      updatedAt: firstRow.updatedAt,
      purchaseOrderId: firstRow.purchaseOrderId,
      purchaseOrder: firstRow.purchaseOrder,
      items: siblingRows.map((row) => ({
        id: row.id,
        productId: row.productId,
        product: row.product,
        productGradeId: row.productGradeId,
        productGrade: row.productGrade,
        quantity: row.quantity,
        uomId: row.uomId,
        uom: row.uom,
        brand: row.brand,
        status: row.status,
        isDeleted: row.isDeleted,
      })),
    };
  },

  async updateRequest(domainId: string, id: string, data: any) {
    const request = await prisma.rawMaterialPurchaseRequest.findFirst({
      where: { id, domainId, isDeleted: false },
    });
    if (!request) {
      throw new Error(Messages.RAW_MATERIAL_PURCHASE_REQUEST.NOT_FOUND);
    }

    if (!editableStatuses.includes(request.approvalStatus)) {
      throw new Error(
        'Only pending or rejected purchase requests can be updated',
      );
    }

    const relationData = {
      productId: data.productId,
      productGradeId: data.productGradeId,
      uomId: data.uomId,
      projectId: data.projectId,
      documentId: data.documentId,
    };
    await ensureRelationsBelongToDomain(domainId, relationData);

    const {
      productId,
      productGradeId,
      quantity,
      uomId,
      brand,
      ...sharedFields
    } = data;

    if (sharedFields.requiredBy) {
      sharedFields.requiredBy = new Date(sharedFields.requiredBy);
    }

    return prisma.$transaction(async (tx) => {
      const specificUpdate: any = {};
      if (productId) specificUpdate.productId = productId;
      if (productGradeId) specificUpdate.productGradeId = productGradeId;
      if (quantity) specificUpdate.quantity = quantity;
      if (uomId) specificUpdate.uomId = uomId;
      if (brand !== undefined) specificUpdate.brand = brand;
      if (data.status) specificUpdate.status = data.status;

      Object.assign(specificUpdate, sharedFields);

      const updated = await tx.rawMaterialPurchaseRequest.update({
        where: { id },
        data: specificUpdate,
      });

      if (Object.keys(sharedFields).length > 0) {
        await tx.rawMaterialPurchaseRequest.updateMany({
          where: {
            code: request.code,
            domainId,
            id: { not: id },
            isDeleted: false,
          },
          data: sharedFields,
        });
      }

      return updated;
    });
  },

  async deleteRequest(domainId: string, id: string) {
    const request = await prisma.rawMaterialPurchaseRequest.findFirst({
      where: { id, domainId, isDeleted: false },
    });
    if (!request) {
      throw new Error(Messages.RAW_MATERIAL_PURCHASE_REQUEST.NOT_FOUND);
    }

    if (request.approvalStatus === ApprovalStatus.APPROVED) {
      throw new Error('Approved purchase requests cannot be deleted');
    }

    return RawMaterialPurchaseRequestRepository.softDelete(id);
  },

  async deleteRequestByCode(domainId: string, code: string) {
    const requests = await prisma.rawMaterialPurchaseRequest.findMany({
      where: { code, domainId, isDeleted: false },
    });
    if (requests.length === 0) {
      throw new Error(Messages.RAW_MATERIAL_PURCHASE_REQUEST.NOT_FOUND);
    }

    const hasApproved = requests.some(
      (r) => r.approvalStatus === ApprovalStatus.APPROVED,
    );
    if (hasApproved) {
      throw new Error('Approved purchase requests cannot be deleted');
    }

    return prisma.rawMaterialPurchaseRequest.updateMany({
      where: { code, domainId, isDeleted: false },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },

  async updateRequestByCodeAndProduct(
    domainId: string,
    code: string,
    productId: string,
    data: any,
  ) {
    const request = await prisma.rawMaterialPurchaseRequest.findFirst({
      where: { code, productId, domainId, isDeleted: false },
    });
    if (!request) {
      throw new Error(Messages.RAW_MATERIAL_PURCHASE_REQUEST.NOT_FOUND);
    }

    if (!editableStatuses.includes(request.approvalStatus)) {
      throw new Error(
        'Only pending or rejected purchase requests can be updated',
      );
    }

    const relationData = {
      productId: data.productId,
      productGradeId: data.productGradeId,
      uomId: data.uomId,
      projectId: data.projectId,
      documentId: data.documentId,
    };
    await ensureRelationsBelongToDomain(domainId, relationData);

    const {
      productId: newProductId,
      productGradeId,
      quantity,
      uomId,
      brand,
      ...sharedFields
    } = data;

    if (sharedFields.requiredBy) {
      sharedFields.requiredBy = new Date(sharedFields.requiredBy);
    }

    return prisma.$transaction(async (tx) => {
      const specificUpdate: any = {};
      if (newProductId) specificUpdate.productId = newProductId;
      if (productGradeId) specificUpdate.productGradeId = productGradeId;
      if (quantity) specificUpdate.quantity = quantity;
      if (uomId) specificUpdate.uomId = uomId;
      if (brand !== undefined) specificUpdate.brand = brand;
      if (data.status) specificUpdate.status = data.status;

      Object.assign(specificUpdate, sharedFields);

      const updated = await tx.rawMaterialPurchaseRequest.update({
        where: { id: request.id },
        data: specificUpdate,
      });

      if (Object.keys(sharedFields).length > 0) {
        await tx.rawMaterialPurchaseRequest.updateMany({
          where: {
            code,
            domainId,
            id: { not: request.id },
            isDeleted: false,
          },
          data: sharedFields,
        });
      }

      return updated;
    });
  },

  async approveOrRejectRequests(
    domainId: string,
    code: string,
    approvalStatus: ApprovalStatus,
  ) {
    const siblingRequests = await prisma.rawMaterialPurchaseRequest.findMany({
      where: { code, domainId, isDeleted: false },
    });

    if (!siblingRequests.length) {
      throw new Error(Messages.RAW_MATERIAL_PURCHASE_REQUEST.NOT_FOUND);
    }

    if (approvalStatus === ApprovalStatus.REJECTED) {
      const anyApproved = siblingRequests.some(
        (r) => r.approvalStatus === ApprovalStatus.APPROVED,
      );
      if (anyApproved) {
        throw new Error('Approved purchase requests cannot be rejected');
      }

      await prisma.rawMaterialPurchaseRequest.updateMany({
        where: { code, domainId, isDeleted: false },
        data: {
          approvalStatus: ApprovalStatus.REJECTED,
          approvedAt: null,
        },
      });

      return prisma.rawMaterialPurchaseRequest.findMany({
        where: { code, domainId },
      });
    }

    const anyActioned = siblingRequests.some(
      (r) => !editableStatuses.includes(r.approvalStatus),
    );
    if (anyActioned) {
      throw new Error(Messages.RAW_MATERIAL_PURCHASE_REQUEST.ALREADY_ACTIONED);
    }

    const poCode = RawMaterialPurchaseRequestService.generatePoCode(domainId);
    return RawMaterialPurchaseRequestRepository.approveAndCreatePO(
      code,
      domainId,
      poCode,
    );
  },

  // --- Purchase Order Methods ---

  async listPurchaseOrders(
    authDomainId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: 'ACTIVE' | 'INACTIVE';
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
