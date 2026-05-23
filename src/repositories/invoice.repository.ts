import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';

export const invoiceRepository = {
  async create(
    data: {
      invoiceCode: string;
      purchaseOrderId: string;
      vendorId?: string;
      vendorName: string;
      invoiceDate?: Date;
      dueDate?: Date;
      totalAmount?: number;
      totalTax?: number;
      projectId?: string;
      domainId: string;
    },
    items?: {
      productId: string;
      productGradeId?: string;
      description?: string;
      quantity: number;
      uomId: string;
      vendor?: string;
      taxAmount?: number;
      totalAmount?: number;
      discount?: number;
      domainId: string;
    }[],
  ) {
    return prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findFirst({
        where: { id: data.purchaseOrderId, domainId: data.domainId },
      });
      const projectId = data.projectId || po?.projectId;
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const invoice = await tx.invoice.create({
        data: {
          invoiceCode: data.invoiceCode,
          purchaseOrderId: data.purchaseOrderId,
          vendorId: data.vendorId,
          vendorName: data.vendorName,
          invoiceDate: data.invoiceDate ?? new Date(),
          dueDate: data.dueDate,
          totalAmount: data.totalAmount ?? 0,
          totalTax: data.totalTax ?? 0,
          projectId,
          domainId: data.domainId,
        },
      });

      if (items && items.length > 0) {
        await tx.invoiceItem.createMany({
          data: items.map((item) => ({
            invoiceId: invoice.id,
            productId: item.productId,
            productGradeId: item.productGradeId,
            description: item.description,
            quantity: item.quantity,
            uomId: item.uomId,
            taxAmount: item.taxAmount ?? 0,
            totalAmount: item.totalAmount ?? 0,
            discount: item.discount ?? 0,
            domainId: item.domainId,
          })),
        });
      }

      // Recalculate totals from items
      const createdItems = await tx.invoiceItem.findMany({
        where: { invoiceId: invoice.id },
      });

      const totalTax = createdItems.reduce((sum, i) => sum + i.taxAmount, 0);
      const totalAmount = createdItems.reduce(
        (sum, i) => sum + i.totalAmount,
        0,
      );

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: { totalTax, totalAmount },
        include: {
          items: {
            include: {
              product: { select: { displayName: true, code: true } },
              productGrade: {
                select: { gradeDisplayName: true, gradeCode: true },
              },
              uom: { select: { displayName: true, code: true } },
            },
          },
          purchaseOrder: { select: { id: true, code: true } },
          project: { select: { id: true, name: true, code: true } },
        },
      });

      return updatedInvoice;
    });
  },

  findByIdAndDomain(id: string, domainId: string) {
    return prisma.invoice.findFirst({
      where: { id, domainId, isDeleted: false },
      include: {
        items: {
          include: {
            product: { select: { displayName: true, code: true } },
            productGrade: {
              select: { gradeDisplayName: true, gradeCode: true },
            },
            uom: { select: { displayName: true, code: true } },
          },
        },
        purchaseOrder: { select: { id: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
      },
    });
  },

  listByDomain(
    domainId: string,
    limit: number,
    offset: number,
    filter?: {
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      vendorName?: string;
      purchaseOrderId?: string;
      projectId?: string;
    },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    const where: Prisma.InvoiceWhereInput = {
      domainId,
      isDeleted: false,
      ...(filter?.status && { status: filter.status }),
      ...(filter?.vendorName && {
        vendorName: { contains: filter.vendorName, mode: 'insensitive' },
      }),
      ...(filter?.purchaseOrderId && {
        purchaseOrderId: filter.purchaseOrderId,
      }),
      ...(filter?.projectId && { projectId: filter.projectId }),
      ...(searchKey && {
        OR: [
          { invoiceCode: { contains: searchKey, mode: 'insensitive' } },
          { vendorName: { contains: searchKey, mode: 'insensitive' } },
        ],
      }),
    };

    return prisma.$transaction([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: { select: { displayName: true, code: true } },
              productGrade: {
                select: { gradeDisplayName: true, gradeCode: true },
              },
              uom: { select: { displayName: true, code: true } },
            },
          },
          purchaseOrder: { select: { id: true, code: true } },
          project: { select: { id: true, name: true, code: true } },
        },
      }),
    ]);
  },

  update(id: string, data: Prisma.InvoiceUncheckedUpdateInput) {
    return prisma.invoice.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            product: { select: { displayName: true, code: true } },
            productGrade: {
              select: { gradeDisplayName: true, gradeCode: true },
            },
            uom: { select: { displayName: true, code: true } },
          },
        },
        purchaseOrder: { select: { id: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
      },
    });
  },

  softDelete(id: string) {
    return prisma.invoice.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },

  // --- Invoice Items ---

  listItemsByInvoice(invoiceId: string, domainId: string) {
    return prisma.invoiceItem.findMany({
      where: { invoiceId, domainId },
      include: {
        product: { select: { displayName: true, code: true } },
        productGrade: {
          select: { gradeDisplayName: true, gradeCode: true },
        },
        uom: { select: { displayName: true, code: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  updateItem(id: string, data: Prisma.InvoiceItemUncheckedUpdateInput) {
    return prisma.invoiceItem.update({
      where: { id },
      data,
      include: {
        product: { select: { displayName: true, code: true } },
        productGrade: {
          select: { gradeDisplayName: true, gradeCode: true },
        },
        uom: { select: { displayName: true, code: true } },
      },
    });
  },

  findItemById(id: string) {
    return prisma.invoiceItem.findFirst({
      where: { id },
      include: {
        product: { select: { displayName: true, code: true } },
        productGrade: {
          select: { gradeDisplayName: true, gradeCode: true },
        },
        uom: { select: { displayName: true, code: true } },
      },
    });
  },

  // --- Generate invoices from PO using VendorProductPricing ---
  // Each assignment maps a PO product → a VendorProductPricing entry.
  // The system groups assignments by vendor and creates one Invoice per vendor.

  async generateFromPurchaseOrder(
    poId: string,
    domainId: string,
    assignments: {
      purchaseOrderProductId: string;
      vendorProductPricingId: string;
    }[],
  ) {
    return prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findFirst({
        where: { id: poId, domainId, isDeleted: false },
        include: {
          purchaseOrderProducts: {
            where: { isDeleted: false },
          },
        },
      });

      if (!po) throw new Error('Purchase order not found');

      // Check if invoices already exist for this PO
      const existing = await tx.invoice.count({
        where: { purchaseOrderId: poId, domainId, isDeleted: false },
      });
      if (existing > 0) {
        throw new Error(
          'Invoices have already been generated for this purchase order',
        );
      }

      // Validate all PO products are covered
      const poProductIds = new Set(po.purchaseOrderProducts.map((p) => p.id));
      const assignedIds = new Set(
        assignments.map((a) => a.purchaseOrderProductId),
      );
      for (const id of poProductIds) {
        if (!assignedIds.has(id)) {
          throw new Error(`PO product ${id} is not assigned to any vendor`);
        }
      }

      // Resolve each assignment: look up VendorProductPricing + PO product
      type ResolvedAssignment = {
        poProduct: (typeof po.purchaseOrderProducts)[0];
        pricing: {
          id: string;
          vendorName: string;
          productId: string;
          productGradeId: string;
          uomId: string;
          price: number;
        };
      };

      const resolved: ResolvedAssignment[] = [];
      for (const assignment of assignments) {
        const poProduct = po.purchaseOrderProducts.find(
          (p) => p.id === assignment.purchaseOrderProductId,
        );
        if (!poProduct) {
          throw new Error(
            `PO product ${assignment.purchaseOrderProductId} not found`,
          );
        }

        const pricing = await tx.vendorProductPricing.findFirst({
          where: {
            id: assignment.vendorProductPricingId,
            domainId,
            isDeleted: false,
          },
        });
        if (!pricing) {
          throw new Error(
            `Vendor product pricing ${assignment.vendorProductPricingId} not found`,
          );
        }

        resolved.push({ poProduct, pricing });
      }

      // Group resolved assignments by vendorName
      const vendorGroups: Record<string, ResolvedAssignment[]> = {};
      for (const item of resolved) {
        const vendor = item.pricing.vendorName;
        if (!vendorGroups[vendor]) vendorGroups[vendor] = [];
        vendorGroups[vendor].push(item);
      }

      const invoices = [];

      for (const [vendorName, items] of Object.entries(vendorGroups)) {
        const suffix = domainId.slice(0, 4).toUpperCase();
        const invoiceCode = `INV-${suffix}-${Date.now()}`;

        // Calculate totals using pricing from VendorProductPricing
        const totalTax = items.reduce(
          (sum, i) => sum + i.poProduct.tax * i.poProduct.quantity,
          0,
        );
        const totalAmount = items.reduce(
          (sum, i) =>
            sum +
            i.pricing.price * i.poProduct.quantity +
            i.poProduct.tax * i.poProduct.quantity,
          0,
        );

        if (!po.projectId) {
          throw new Error('Purchase order does not have an associated project');
        }

        const invoice = await tx.invoice.create({
          data: {
            invoiceCode,
            purchaseOrderId: poId,
            vendorName,
            totalTax,
            totalAmount,
            projectId: po.projectId,
            domainId,
          },
        });

        // Create invoice items from the resolved assignments
        for (const item of items) {
          const itemTax = item.poProduct.tax * item.poProduct.quantity;
          const itemTotal =
            item.pricing.price * item.poProduct.quantity + itemTax;

          await tx.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              productId: item.pricing.productId,
              productGradeId: item.pricing.productGradeId,
              description: `${item.poProduct.productName}${item.poProduct.productGradeName ? ' - ' + item.poProduct.productGradeName : ''}`,
              quantity: item.poProduct.quantity,
              uomId: item.pricing.uomId,
              taxAmount: itemTax,
              totalAmount: itemTotal,
              discount: 0,
              domainId,
            },
          });
        }

        // Small delay for unique invoice codes
        await new Promise((resolve) => setTimeout(resolve, 2));

        const fullInvoice = await tx.invoice.findFirst({
          where: { id: invoice.id },
          include: {
            items: {
              include: {
                product: { select: { displayName: true, code: true } },
                productGrade: {
                  select: { gradeDisplayName: true, gradeCode: true },
                },
                uom: { select: { displayName: true, code: true } },
              },
            },
            purchaseOrder: { select: { id: true, code: true } },
            project: { select: { id: true, name: true, code: true } },
          },
        });

        invoices.push(fullInvoice);
      }

      return invoices;
    });
  },
};
