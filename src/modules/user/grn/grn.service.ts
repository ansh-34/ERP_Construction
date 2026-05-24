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
      wbReference?: string;
      invoiceId: string;
      totalItems: number;
      totalTax: number;
      totalAmount: number;
    },
  ) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: data.invoiceId, domainId, isDeleted: false },
      include: {
        purchaseOrder: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (!invoice.vendorId) {
      throw new Error('Invoice does not have a vendor pricing associated');
    }

    const po = invoice.purchaseOrder;
    if (po.orderStatus !== 'PENDING_VENDOR' && po.orderStatus !== 'INVOICED') {
      throw new Error('GRN can only be created against an active PO');
    }

    const code = await GrnService.generateCode();
    const currentDate = new Date();

    const grnProjectId = invoice.projectId;

    const grnProducts = (invoice.items || []).map((item: any) => {
      const rate =
        item.quantity > 0
          ? (item.totalAmount - item.taxAmount) / item.quantity
          : 0;
      return {
        material:
          item.description || item.product?.displayName || 'Unknown Material',
        quantity: item.quantity,
        tax: item.taxAmount,
        rate,
        uomId: item.uomId,
        projectId: invoice.projectId,
        invoiceId: invoice.id,
        vendor: invoice.vendorName,
        date: currentDate,
      };
    });

    return GrnRepository.create(
      {
        ...data,
        code,
        domainId,
        date: currentDate,
        productOrderCode: po.code,
        vendorId: invoice.vendorId,
        vendorName: invoice.vendorName,
        projectId: grnProjectId,
      },
      grnProducts,
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

  async updateGrn(
    domainId: string,
    id: string,
    data: {
      wbReference?: string;
      totalItems?: number;
      totalTax?: number;
      totalAmount?: number;
      grnProducts?: any[];
      status?: 'ACTIVE' | 'INACTIVE';
    },
  ) {
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

    const { grnProducts, ...grnData } = data;

    return prisma.$transaction(async (tx) => {
      const updatedFields: any = { ...grnData };

      const updatedGrn = await tx.grn.update({
        where: { id },
        data: updatedFields,
      });

      if (grnProducts !== undefined) {
        const finalInvoice = await tx.invoice.findFirst({
          where: { id: updatedGrn.invoiceId, domainId },
        });
        const finalVendor = finalInvoice
          ? finalInvoice.vendorName
          : updatedGrn.vendorName;
        const finalProjectId = finalInvoice
          ? finalInvoice.projectId
          : updatedGrn.projectId;

        for (const p of grnProducts) {
          const productData = {
            material: p.material,
            quantity: p.quantity,
            rate: p.rate ?? 0,
            tax: p.tax ?? 0,
            uomId: p.uomId,
          };

          if (p.id) {
            await tx.grnProduct.update({
              where: { id: p.id },
              data: {
                ...productData,
                isDeleted: false,
                status: 'ACTIVE',
              },
            });
          } else {
            await tx.grnProduct.create({
              data: {
                ...productData,
                grnId: id,
                grnCode: updatedGrn.code,
                date: new Date(),
                vendor: finalVendor,
                projectId: finalProjectId,
                invoiceId: updatedGrn.invoiceId,
                domainId,
                status: 'ACTIVE',
              },
            });
          }
        }

        await GrnRepository.recalculateGrnTotals(tx, id, domainId);
      }

      const res = await tx.grn.findFirst({
        where: { id },
        include: {
          project: true,
          invoice: true,
          grnProducts: {
            where: { isDeleted: false },
            include: { uom: true, project: true, invoice: true },
          },
        },
      });
      return GrnRepository.mapGrn(res);
    });
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

  async createGrnProduct(domainId: string, grnId: string, data: any) {
    const grn = await GrnRepository.findByIdAndDomain(grnId, domainId);
    if (!grn) throw new Error(Messages.GRN.NOT_FOUND);
    if (grn.approvalStatus === ApprovalStatus.APPROVED) {
      throw new Error('Cannot add products to an approved GRN');
    }

    return GrnRepository.createGrnProduct(grnId, domainId, {
      ...data,
      grnCode: grn.code,
      date: new Date(),
      vendor: grn.vendorName,
      projectId: grn.projectId,
      invoiceId: grn.invoiceId,
      domainId,
    });
  },

  async listGrnProducts(domainId: string, grnId: string) {
    return GrnRepository.listGrnProducts(grnId, domainId);
  },

  async updateGrnProduct(
    domainId: string,
    grnId: string,
    productId: string,
    data: any,
  ) {
    const grn = await GrnRepository.findByIdAndDomain(grnId, domainId);
    if (!grn) throw new Error(Messages.GRN.NOT_FOUND);
    if (grn.approvalStatus === ApprovalStatus.APPROVED) {
      throw new Error('Cannot update products in an approved GRN');
    }

    const product = await GrnRepository.getGrnProductById(
      productId,
      grnId,
      domainId,
    );
    if (!product) throw new Error('Product not found');

    return GrnRepository.updateGrnProduct(productId, grnId, domainId, data);
  },

  async deleteGrnProduct(domainId: string, grnId: string, productId: string) {
    const grn = await GrnRepository.findByIdAndDomain(grnId, domainId);
    if (!grn) throw new Error(Messages.GRN.NOT_FOUND);
    if (grn.approvalStatus === ApprovalStatus.APPROVED) {
      throw new Error('Cannot delete products from an approved GRN');
    }

    const product = await GrnRepository.getGrnProductById(
      productId,
      grnId,
      domainId,
    );
    if (!product) throw new Error('Product not found');

    return GrnRepository.deleteGrnProduct(productId, grnId, domainId);
  },
};
