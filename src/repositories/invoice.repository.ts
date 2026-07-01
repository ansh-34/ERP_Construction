import { Prisma } from '../infra/database/prisma/generated/prisma/client/client.js';
import prisma from '../infra/database/prisma/prisma.client.js';
import { enqueuePdfGeneration } from '../queue/pdfQueue.js';

const toDisplayString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.en === 'string') return record.en;
    if (typeof record.name === 'string') return record.name;
  }
  return JSON.stringify(value ?? '');
};

// PaymentRequest.requestedBy is an FK to User. Invoice generation can be triggered
// by a domain owner whose token id is the domain (not a User row), so only keep the
// id when it actually references a User; otherwise store null.
const resolveRequestedBy = async (
  tx: { user: { findFirst: (args: any) => Promise<{ id: string } | null> } },
  requestedBy: string | null | undefined,
): Promise<string | null> => {
  if (!requestedBy) return null;
  const user = await tx.user.findFirst({
    where: { id: requestedBy },
    select: { id: true },
  });
  return user ? requestedBy : null;
};

// Mirrors PaymentRequestService.generateCode() so payment requests auto-created
// alongside invoices share the same PR-<timestamp> code format.
const generatePaymentRequestCode = (): string => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `PR-${dd}${mm}${yyyy}${hh}${min}${ss}${ms}`;
};

export interface PriceIncreaseAlertCandidate {
  invoiceId: string;
  invoiceCode: string;
  invoiceItemId: string;
  purchaseOrderId: string;
  productId: string;
  productGradeId: string | null;
  uomId: string;
  uomCode: string | null;
  productName: string;
  productGradeName: string | null;
  vendorName: string;
  lastVendorName: string | null;
  currentPrice: number;
  lastPrice: number;
  purchaseType: 'IMPORT' | 'LOCAL' | null;
  purchaseDate: Date;
}

export interface GeneratePurchaseOrderInvoiceResult {
  invoices: any[];
  priceIncreaseAlerts: PriceIncreaseAlertCandidate[];
}

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
    const updatedInvoice = await prisma.$transaction(async (tx) => {
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
      const totalItems = createdItems.reduce((sum, i) => sum + i.quantity, 0);

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: { totalTax, totalAmount, totalItems },
        include: {
          items: {
            include: {
              product: { select: { displayName: true, code: true } },
              productGrade: {
                select: { gradeDisplayName: true, gradeCode: true },
              },
              uom: { select: { symbol: true, displayName: true, code: true } },
            },
          },
          purchaseOrder: { select: { id: true, code: true } },
          project: { select: { id: true, name: true, code: true } },
        },
      });

      return updatedInvoice;
    });

    enqueuePdfGeneration(updatedInvoice.id).catch((err) => {
      console.error(
        `[Queue Error] Failed to enqueue PDF generation for Invoice ${updatedInvoice.id}:`,
        err,
      );
    });

    return updatedInvoice;
  },

  async count(options: {
    filters: {
      domainId?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      adminId?: string;
    };
  }) {
    const whereClause: any = {
      isDeleted: false,
      ...(options.filters && {
        ...(options.filters.domainId && { domainId: options.filters.domainId }),
        ...(options.filters.status && { status: options.filters.status }),
        ...(options.filters.searchKey && {
          searchText: { contains: options.filters.searchKey },
        }),
        ...(options.filters.adminId && { adminId: options.filters.adminId }),
      }),
    };

    return prisma.invoice.count({ where: whereClause });
  },

  findByIdAndDomain(
    id: string,
    domainId: string,
    opts?: {
      invoiceType?: 'PROFORMA' | 'FINAL';
      lifecycle?: 'ACTIVE' | 'VOID';
    },
  ) {
    return prisma.invoice.findFirst({
      where: {
        id,
        domainId,
        isDeleted: false,
        ...(opts?.invoiceType && { invoiceType: opts.invoiceType }),
        ...(opts?.lifecycle && { lifecycle: opts.lifecycle }),
      },
      include: {
        items: {
          include: {
            product: { select: { displayName: true, code: true } },
            productGrade: {
              select: { gradeDisplayName: true, gradeCode: true },
            },
            uom: { select: { symbol: true, displayName: true, code: true } },
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
      invoiceType?: 'PROFORMA' | 'FINAL';
      lifecycle?: 'ACTIVE' | 'VOID';
    },
  ) {
    const searchKey = filter?.searchKey?.trim() || '';
    const where: Prisma.InvoiceWhereInput = {
      domainId,
      isDeleted: false,
      // List everything by default; callers filter via ?lifecycle= or use the
      // dedicated /active endpoints.
      ...(filter?.lifecycle && { lifecycle: filter.lifecycle }),
      ...(filter?.invoiceType && { invoiceType: filter.invoiceType }),
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
              uom: { select: { symbol: true, displayName: true, code: true } },
            },
          },
          purchaseOrder: { select: { id: true, code: true } },
          project: { select: { id: true, name: true, code: true } },
        },
      }),
    ]);
  },

  update(id: string, data: Prisma.InvoiceUncheckedUpdateInput, tx?: any) {
    const client = tx || prisma;
    return client.invoice.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            product: { select: { displayName: true, code: true } },
            productGrade: {
              select: { gradeDisplayName: true, gradeCode: true },
            },
            uom: { select: { symbol: true, displayName: true, code: true } },
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
        uom: { select: { symbol: true, displayName: true, code: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  listInvoiceItems(
    limit: number,
    offset: number,
    options: {
      filters?: {
        searchKey?: string;
        invoiceId?: string;
        projectId?: string;
        vendorId?: string;
        status?: string;
        domainId: string;
      };
      select?: any;
    } = {},
  ) {
    const whereClause: any = {
      ...(options.filters && {
        ...(options.filters.searchKey && {
          OR: [
            {
              product: {
                searchText: {
                  contains: options.filters.searchKey,
                  mode: 'insensitive',
                },
              },
            },
            {
              product: {
                code: {
                  contains: options.filters.searchKey,
                  mode: 'insensitive',
                },
              },
            },
            {
              productGrade: {
                searchText: {
                  contains: options.filters.searchKey,
                  mode: 'insensitive',
                },
              },
            },
            {
              productGrade: {
                code: {
                  contains: options.filters.searchKey,
                  mode: 'insensitive',
                },
              },
            },
          ],
        }),
        ...(options.filters.status && { status: options.filters.status }),
        ...(options.filters.invoiceId && {
          invoiceId: options.filters.invoiceId,
        }),
        ...(options.filters.projectId && {
          projectId: options.filters.projectId,
        }),
        ...(options.filters.vendorId && { vendorId: options.filters.vendorId }),
        ...(options.filters.domainId && { domainId: options.filters.domainId }),
      }),
    };

    return prisma.$transaction([
      prisma.invoiceItem.count({ where: whereClause }),
      prisma.invoiceItem.findMany({
        where: whereClause,
        ...(options.select ? { select: options.select } : {}),
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);
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
        uom: { select: { symbol: true, displayName: true, code: true } },
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
        uom: { select: { symbol: true, displayName: true, code: true } },
      },
    });
  },

  // --- Generate invoices from PO using VendorProductPricing ---
  // Each assignment maps a PO product → a VendorProductPricing entry.
  // The system groups assignments by vendor and creates one Invoice per vendor.

  async generateFromPurchaseOrder(
    poId: string,
    domainId: string,
    requestedBy: string,
    assignments: {
      purchaseOrderProductId: string;
      vendorProductPricingId: string;
    }[],
  ): Promise<GeneratePurchaseOrderInvoiceResult> {
    const result = await prisma.$transaction(async (tx) => {
      const priceIncreaseAlerts: PriceIncreaseAlertCandidate[] = [];

      // requestedBy must reference a real User. When the action is performed by a
      // domain owner (whose token id is the domain, not a User), store null.
      const prRequestedBy = await resolveRequestedBy(tx, requestedBy);

      const po = await tx.purchaseOrder.findFirst({
        where: { id: poId, domainId, isDeleted: false },
        include: {
          purchaseOrderProducts: {
            where: { isDeleted: false },
          },
          rawMaterialPurchaseRequests: {
            where: { isDeleted: false },
            select: { productId: true, productGradeId: true, type: true },
          },
        },
      });

      if (!po) throw new Error('Purchase order not found');

      // Map IMPORT/LOCAL purchase type per product+grade from the source RMPRs.
      const purchaseTypeByProductGrade = new Map<string, 'IMPORT' | 'LOCAL'>();
      for (const rmpr of po.rawMaterialPurchaseRequests) {
        purchaseTypeByProductGrade.set(
          `${rmpr.productId}|${rmpr.productGradeId}`,
          rmpr.type,
        );
      }

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
          vendor?: { id: string; name: string } | null;
          productId: string;
          productGradeId: string;
          uomId: string;
          uom?: { code: string; displayName: unknown } | null;
          price: number;
          currencyId: string | null;
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

        const pricing: any = await tx.vendorProductPricing.findFirst({
          where: {
            id: assignment.vendorProductPricingId,
            domainId,
            isDeleted: false,
          },
          include: {
            vendor: { select: { id: true, name: true } },
            uom: { select: { symbol: true, code: true, displayName: true } },
          },
        });
        if (!pricing) {
          throw new Error(
            `Vendor product pricing ${assignment.vendorProductPricingId} not found`,
          );
        }

        resolved.push({ poProduct, pricing });
      }

      // Group resolved assignments by vendor name (from the vendor relation)
      const vendorGroups: Record<string, ResolvedAssignment[]> = {};
      for (const item of resolved) {
        const vendor = item.pricing.vendor?.name ?? 'Unknown Vendor';
        if (!vendorGroups[vendor]) vendorGroups[vendor] = [];
        vendorGroups[vendor].push(item);
      }

      const invoices = [];

      for (const [vendorName, items] of Object.entries(vendorGroups)) {
        const suffix = domainId.slice(0, 4).toUpperCase();
        const invoiceCode = `INV-${suffix}-${Date.now()}`;

        // Tax is not tracked: totalTax stays 0 and totals exclude tax.
        const totalTax = 0;
        const totalAmount = items.reduce(
          (sum, i) => sum + i.pricing.price * i.poProduct.quantity,
          0,
        );
        if (!po.projectId) {
          throw new Error('Purchase order does not have an associated project');
        }

        const totalItems = items.reduce(
          (sum, i) => sum + i.poProduct.quantity,
          0,
        );

        const invoice = await tx.invoice.create({
          data: {
            invoiceCode,
            purchaseOrderId: poId,
            vendorName,
            vendorId: items[0].pricing.id,
            totalTax,
            totalAmount,
            totalItems,
            projectId: po.projectId,
            domainId,
            invoiceType: 'PROFORMA',
          },
        });

        // The first invoice generated from a PO is provisional (proforma); spawn a
        // matching payment request immediately so finance is in the loop.
        await tx.paymentRequest.create({
          data: {
            code: generatePaymentRequestCode(),
            type: 'PROFORMA',
            vendorId: items[0].pricing.id,
            projectId: po.projectId,
            tds: 0,
            grossAmount: totalAmount,
            netPayable: totalAmount,
            requestedBy: prRequestedBy,
            invoiceId: invoice.id,
            domainId,
          },
        });

        // Create invoice items from the resolved assignments
        for (const item of items) {
          const itemTotal = item.pricing.price * item.poProduct.quantity;

          const invoiceItem = await tx.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              productId: item.pricing.productId,
              productGradeId: item.pricing.productGradeId,
              description: `${toDisplayString(item.poProduct.productName)}${item.poProduct.productGradeName ? ' - ' + toDisplayString(item.poProduct.productGradeName) : ''}`,
              quantity: item.poProduct.quantity,
              uomId: item.pricing.uomId,
              rate: item.pricing.price,
              rateDifference: 0,
              taxAmount: 0,
              totalAmount: itemTotal,
              discount: 0,
              domainId,
            },
          });

          await tx.purchaseOrderProduct.update({
            where: { id: item.poProduct.id },
            data: { rate: item.pricing.price },
          });

          // Record the price paid as the latest vendor purchase rate for this
          // product/grade/uom/type. One current row per (product, grade, uom,
          // IMPORT|LOCAL). Only overwrite when this invoice is at least as recent
          // as what is stored, so a later-generated but back-dated invoice can't
          // clobber a newer rate.
          const purchaseType =
            purchaseTypeByProductGrade.get(
              `${item.pricing.productId}|${item.pricing.productGradeId}`,
            ) ?? null;

          const rateValues = {
            lastPrice: item.pricing.price,
            purchaseType,
            currencyId: item.pricing.currencyId,
            vendorId: item.pricing.vendor?.id ?? null,
            vendorName,
            lastInvoiceId: invoice.id,
            lastPurchaseDate: invoice.invoiceDate,
            searchText: vendorName.toLowerCase(),
            status: 'ACTIVE' as const,
            isDeleted: false,
          };

          const existingRate = await tx.productGradeLastPurchaseRate.findFirst({
            where: {
              productId: item.pricing.productId,
              productGradeId: item.pricing.productGradeId,
              uomId: item.pricing.uomId,
              purchaseType,
              domainId,
            },
            select: {
              id: true,
              lastPrice: true,
              lastPurchaseDate: true,
              vendorName: true,
            },
          });

          if (existingRate && item.pricing.price > existingRate.lastPrice) {
            priceIncreaseAlerts.push({
              invoiceId: invoice.id,
              invoiceCode,
              invoiceItemId: invoiceItem.id,
              purchaseOrderId: poId,
              productId: item.pricing.productId,
              productGradeId: item.pricing.productGradeId ?? null,
              uomId: item.pricing.uomId,
              uomCode: item.pricing.uom?.code ?? null,
              productName: toDisplayString(item.poProduct.productName),
              productGradeName: item.poProduct.productGradeName
                ? toDisplayString(item.poProduct.productGradeName)
                : null,
              vendorName,
              lastVendorName: existingRate.vendorName ?? null,
              currentPrice: item.pricing.price,
              lastPrice: existingRate.lastPrice,
              purchaseType,
              purchaseDate: invoice.invoiceDate,
            });
          }

          if (!existingRate) {
            await tx.productGradeLastPurchaseRate.create({
              data: {
                productId: item.pricing.productId,
                productGradeId: item.pricing.productGradeId,
                uomId: item.pricing.uomId,
                domainId,
                ...rateValues,
              },
            });
          } else if (invoice.invoiceDate >= existingRate.lastPurchaseDate) {
            await tx.productGradeLastPurchaseRate.update({
              where: { id: existingRate.id },
              data: rateValues,
            });
          }
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
                uom: {
                  select: { symbol: true, displayName: true, code: true },
                },
              },
            },
            purchaseOrder: { select: { id: true, code: true } },
            project: { select: { id: true, name: true, code: true } },
          },
        });

        invoices.push(fullInvoice);
      }

      await tx.purchaseOrder.update({
        where: { id: poId },
        data: { orderStatus: 'INVOICED' },
      });

      return { invoices, priceIncreaseAlerts };
    });

    for (const inv of result.invoices) {
      if (inv?.id) {
        enqueuePdfGeneration(inv.id).catch((err) => {
          console.error(
            `[Queue Error] Failed to enqueue PDF generation for Invoice ${inv.id}:`,
            err,
          );
        });
      }
    }

    return result;
  },

  // Issue the final (negotiated) invoice that supersedes a proforma. The official
  // submits the complete, corrected item set; we create a fresh FINAL invoice plus
  // a FINAL payment request, then void the proforma invoice and its payment
  // request(s) (kept on record, not deleted).
  async finalizeInvoice(
    proformaId: string,
    domainId: string,
    requestedBy: string,
    payload: {
      // The final invoice is built only from these items. Each line is uniquely
      // identified by (productId, productGradeId, uomId). quantity and rate are
      // required. rateDifference compares against the matching proforma line.
      items: {
        productId: string;
        productGradeId?: string | null;
        uomId: string;
        quantity: number;
        rate: number;
      }[];
    },
  ) {
    const finalInvoice = await prisma.$transaction(async (tx) => {
      const proforma = await tx.invoice.findFirst({
        where: { id: proformaId, domainId, isDeleted: false },
        include: { items: true },
      });
      if (!proforma) throw new Error('Invoice not found');
      if (proforma.invoiceType !== 'PROFORMA') {
        throw new Error('Only a proforma invoice can be finalized');
      }
      if (proforma.lifecycle === 'VOID') {
        throw new Error('Invoice is void and cannot be finalized');
      }

      const prRequestedBy = await resolveRequestedBy(tx, requestedBy);

      // Lines are uniquely identified by product + grade + uom.
      const keyOf = (
        productId: string,
        productGradeId: string | null | undefined,
        uomId: string,
      ) => `${productId}|${productGradeId ?? ''}|${uomId}`;

      const proformaByKey = new Map<string, (typeof proforma.items)[number]>();
      for (const pItem of proforma.items) {
        proformaByKey.set(
          keyOf(pItem.productId, pItem.productGradeId, pItem.uomId),
          pItem,
        );
      }

      // The final invoice contains ONLY the items sent in the body; each must be a
      // unique (product, grade, uom). rateDifference = proforma rate − new rate for
      // the matching proforma line (0 when there is no match).
      const seen = new Set<string>();
      const lines = payload.items.map((item) => {
        const key = keyOf(item.productId, item.productGradeId, item.uomId);
        if (seen.has(key)) {
          throw new Error(
            `Duplicate item for product ${item.productId} / uom ${item.uomId}; product + grade + uom must be unique`,
          );
        }
        seen.add(key);

        const match = proformaByKey.get(key);
        const proformaRate = match?.rate ?? 0;
        return {
          productId: item.productId,
          productGradeId: item.productGradeId ?? null,
          uomId: item.uomId,
          description: match?.description ?? undefined,
          rate: item.rate,
          quantity: item.quantity,
          rateDifference: match ? proformaRate - item.rate : 0,
          itemTotal: item.rate * item.quantity,
        };
      });

      // Tax is not tracked: totalTax stays 0 and totals exclude tax.
      const totalTax = 0;
      const totalAmount = lines.reduce((sum, l) => sum + l.itemTotal, 0);
      const totalItems = lines.reduce((sum, l) => sum + l.quantity, 0);

      const suffix = domainId.slice(0, 4).toUpperCase();
      const invoiceCode = `INV-${suffix}-${Date.now()}`;

      const finalInvoice = await tx.invoice.create({
        data: {
          invoiceCode,
          purchaseOrderId: proforma.purchaseOrderId,
          vendorId: proforma.vendorId,
          vendorName: proforma.vendorName,
          totalTax,
          totalAmount,
          totalItems,
          projectId: proforma.projectId,
          domainId,
          invoiceType: 'FINAL',
        },
      });

      for (const line of lines) {
        await tx.invoiceItem.create({
          data: {
            invoiceId: finalInvoice.id,
            productId: line.productId,
            productGradeId: line.productGradeId,
            description: line.description,
            quantity: line.quantity,
            uomId: line.uomId,
            rate: line.rate,
            rateDifference: line.rateDifference,
            taxAmount: 0,
            totalAmount: line.itemTotal,
            discount: 0,
            domainId,
          },
        });
      }

      // Final payment request for the negotiated amount (no TDS; net = gross).
      await tx.paymentRequest.create({
        data: {
          code: generatePaymentRequestCode(),
          type: 'FINAL',
          vendorId: proforma.vendorId!,
          projectId: proforma.projectId,
          tds: 0,
          grossAmount: totalAmount,
          netPayable: totalAmount,
          requestedBy: prRequestedBy,
          invoiceId: finalInvoice.id,
          domainId,
        },
      });

      // Void the proforma invoice and its payment request(s).
      await tx.invoice.update({
        where: { id: proforma.id },
        data: { lifecycle: 'VOID' },
      });
      await tx.paymentRequest.updateMany({
        where: { invoiceId: proforma.id, domainId, isDeleted: false },
        data: { lifecycle: 'VOID' },
      });

      return tx.invoice.findFirst({
        where: { id: finalInvoice.id },
        include: {
          items: {
            include: {
              product: { select: { displayName: true, code: true } },
              productGrade: {
                select: { gradeDisplayName: true, gradeCode: true },
              },
              uom: { select: { symbol: true, displayName: true, code: true } },
            },
          },
          purchaseOrder: { select: { id: true, code: true } },
          project: { select: { id: true, name: true, code: true } },
        },
      });
    });

    // Note: invoice PDF generation runs only for the proforma, not the final.
    return finalInvoice;
  },

  findFirst(args: any, tx?: any) {
    const client = tx || prisma;
    return client.invoice.findFirst(args);
  },

  countWhere(args: any) {
    return prisma.invoice.count(args);
  },

  findByIdWithDetailsOnly(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            uom: true,
          },
        },
        project: true,
        domain: true,
      },
    });
  },

  findActiveTemplate(domainId: string) {
    return prisma.invoiceTemplate.findFirst({
      where: {
        domainId,
        isDeleted: false,
        status: 'ACTIVE',
      },
    });
  },
};
