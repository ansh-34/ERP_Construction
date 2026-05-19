import { Messages } from '../../../constants/index.js';
import { GrnRepository } from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { ApprovalStatus } from '../../../infra/database/prisma/generated/prisma/client/enums.js';
import prisma from '../../../infra/database/prisma/prisma.client.js';

export const GrnService = {
  async generateCode(): Promise<string> {
    const now = new Date();
    const pad = (n: number, len = 2) => String(n).padStart(len, '0');
    const datePart =
      `${now.getFullYear()}` +
      `${pad(now.getMonth() + 1)}` +
      `${pad(now.getDate())}` +
      `${pad(now.getHours())}` +
      `${pad(now.getMinutes())}` +
      `${pad(now.getSeconds())}`;
    return `GRN-${datePart}`;
  },

  async createGrn(
    domainId: string,
    data: {
      productOrderCode?: string;
      date: Date;
      vendor: string;
      wbReference?: string;
      projectId?: string;
      grnProducts?: any[];
    },
  ) {
    if (data.productOrderCode) {
      const po = await prisma.purchaseOrder.findFirst({
        where: { code: data.productOrderCode, domainId, isDeleted: false },
      });
      if (!po) {
        throw new Error('Purchase Order not found');
      }
      if (po.orderStatus !== 'APPROVED') {
        throw new Error('GRN can only be created against an APPROVED PO');
      }
    }

    const code = await GrnService.generateCode();

    const { grnProducts, ...grnData } = data;

    return GrnRepository.create(
      {
        ...grnData,
        code,
        domainId,
        totalItems: 0,
        totalTax: 0,
        totalAmount: 0,
      },
      grnProducts
        ? grnProducts.map((p) => ({
            ...p,
            grnCode: code,
            projectId: p.projectId || data.projectId || null,
          }))
        : [],
    );
  },

  async listGrns(
    domainId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      approvalStatus?: string;
      projectId?: string;
      [key: string]: any;
    },
  ) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, grns] = await GrnRepository.listByDomain(
      domainId,
      limit,
      offset,
      {
        status: query.status,
        searchKey: query.searchKey,
        approvalStatus: query.approvalStatus,
        projectId: query.projectId,
      },
    );

    return {
      grns,
      pagination: { totalCount, offset, limit },
    };
  },

  async getGrnById(domainId: string, id: string) {
    const grn = await GrnRepository.findByIdWithDetails(id, domainId);
    if (!grn) {
      throw new Error(Messages.GRN.NOT_FOUND);
    }
    return grn;
  },

  async updateGrn(domainId: string, id: string, data: any) {
    const grn = await GrnRepository.findByIdAndDomain(id, domainId);
    if (!grn) {
      throw new Error(Messages.GRN.NOT_FOUND);
    }
    if (
      grn.approvalStatus !== ApprovalStatus.PENDING &&
      grn.approvalStatus !== ApprovalStatus.REJECTED
    ) {
      throw new Error(Messages.GRN.CANNOT_UPDATE_NON_PENDING);
    }
    return GrnRepository.update(id, data);
  },

  async deleteGrn(domainId: string, id: string) {
    const grn = await GrnRepository.findByIdAndDomain(id, domainId);
    if (!grn) {
      throw new Error(Messages.GRN.NOT_FOUND);
    }
    if (grn.approvalStatus === ApprovalStatus.APPROVED) {
      throw new Error('Cannot delete an APPROVED GRN');
    }
    return GrnRepository.softDelete(id);
  },

  async approveOrRejectGrn(
    domainId: string,
    id: string,
    approvalStatus: ApprovalStatus,
  ) {
    const grn = await GrnRepository.findByIdAndDomain(id, domainId);
    if (!grn) {
      throw new Error(Messages.GRN.NOT_FOUND);
    }
    if (grn.approvalStatus !== ApprovalStatus.PENDING) {
      throw new Error(Messages.GRN.ALREADY_ACTIONED);
    }

    if (approvalStatus === ApprovalStatus.APPROVED) {
      return GrnRepository.approveAndUpdateInventory(id, domainId);
    }

    return GrnRepository.reject(id);
  },

  // async createGrnProduct(domainId: string, grnId: string, data: any) {
  //   const grn = await GrnRepository.findByIdAndDomain(grnId, domainId);
  //   if (!grn) throw new Error(Messages.GRN.NOT_FOUND);
  //   if (grn.approvalStatus === ApprovalStatus.APPROVED) {
  //     throw new Error('Cannot add products to an approved GRN');
  //   }

  //   return GrnRepository.createGrnProduct(grnId, domainId, {
  //     ...data,
  //     grnId,
  //     grnCode: grn.code,
  //     domainId,
  //     projectId: data.projectId || grn.projectId || null,
  //   });
  // },

  async listGrnProducts(domainId: string, grnId: string) {
    return GrnRepository.listGrnProducts(grnId, domainId);
  },

  // async updateGrnProduct(domainId: string, grnId: string, productId: string, data: any) {
  //   const grn = await GrnRepository.findByIdAndDomain(grnId, domainId);
  //   if (!grn) throw new Error(Messages.GRN.NOT_FOUND);
  //   if (grn.approvalStatus === ApprovalStatus.APPROVED) {
  //     throw new Error('Cannot update products in an approved GRN');
  //   }

  //   const product = await GrnRepository.getGrnProductById(productId, grnId, domainId);
  //   if (!product) throw new Error('Product not found');

  //   return GrnRepository.updateGrnProduct(productId, grnId, domainId, data);
  // },

  // async deleteGrnProduct(domainId: string, grnId: string, productId: string) {
  //   const grn = await GrnRepository.findByIdAndDomain(grnId, domainId);
  //   if (!grn) throw new Error(Messages.GRN.NOT_FOUND);
  //   if (grn.approvalStatus === ApprovalStatus.APPROVED) {
  //     throw new Error('Cannot delete products from an approved GRN');
  //   }

  //   const product = await GrnRepository.getGrnProductById(productId, grnId, domainId);
  //   if (!product) throw new Error('Product not found');

  //   return GrnRepository.deleteGrnProduct(productId, grnId, domainId);
  // },
};
