import { Messages } from '../../../constants/index.js';
import {
  GrnRepository,
  invoiceRepository,
  vendorProductPriceRepository,
  vendorRepository,
  ProductRepository,
  ProductGradeRepository,
  RawMaterialPurchaseRequestRepository,
} from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { ApprovalStatus } from '../../../infra/database/prisma/generated/prisma/client/enums.js';
import { translateResponse } from '../../../utils/translation.js';
import { transaction } from '../../../infra/database/prisma/transaction.js';

const toMaterialName = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const r = value as Record<string, unknown>;
    if (typeof r.en === 'string') return r.en;
    if (typeof r.name === 'string') return r.name;
  }
  return 'Unknown Material';
};

export interface GrnExcelWorksheet {
  name: string;
  columns: string[];
  rows: Record<string, string | number | null>[];
}

const toDisplayString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.en === 'string') return record.en;
    if (typeof record.name === 'string') return record.name;
  }
  return '';
};

const toDateString = (value: unknown): string => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

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

  async createGrn(domainId: string, data: any) {
    const code = await GrnService.generateCode();
    const currentDate = new Date();

    // --- INVOICE path ---
    if (data.referenceType === 'INVOICE') {
      const invoice = (await invoiceRepository.findFirst({
        where: { id: data.invoiceId, domainId, isDeleted: false },
        include: {
          purchaseOrder: true,
          items: { include: { product: true } },
        },
      })) as any;

      if (!invoice) throw new Error('Invoice not found');
      if (!invoice.vendorId)
        throw new Error('Invoice does not have a vendor pricing associated');

      const po = invoice.purchaseOrder;
      if (po.orderStatus !== 'PENDING_VENDOR' && po.orderStatus !== 'INVOICED')
        throw new Error('GRN can only be created against an active PO');

      const grnProducts: any[] = [];
      for (const p of data.grnProducts) {
        const invoiceItem = (invoice.items || []).find(
          (item: any) => item.productId === p.productId,
        );
        if (!invoiceItem)
          throw new Error(
            `Product ${p.productId} not found on the referenced invoice`,
          );

        const vendorPricing = (await vendorProductPriceRepository.findFirst({
          where: {
            vendorName: invoice.vendorName,
            productId: p.productId,
            productGradeId: invoiceItem.productGradeId ?? undefined,
            uomId: invoiceItem.uomId,
            domainId,
            isDeleted: false,
          },
        })) as any;

        const rate = vendorPricing
          ? vendorPricing.price
          : invoiceItem.quantity > 0
            ? (invoiceItem.totalAmount - invoiceItem.taxAmount) /
              invoiceItem.quantity
            : 0;

        grnProducts.push({
          material:
            invoiceItem.description ||
            toMaterialName(invoiceItem.product?.displayName),
          productId: invoiceItem.productId,
          productGradeId: invoiceItem.productGradeId ?? null,
          quantity: p.quantity,
          tax: 0,
          rate,
          uomId: invoiceItem.uomId,
          projectId: invoice.projectId,
          invoiceId: invoice.id,
          vendor: invoice.vendorName,
          date: currentDate,
        });
      }

      const totalItems = grnProducts.length;
      const totalAmount = grnProducts.reduce(
        (sum: number, p: any) => sum + p.quantity * p.rate,
        0,
      );

      return GrnRepository.create(
        {
          wbReference: data.wbReference,
          referenceType: 'INVOICE',
          invoiceId: invoice.id,
          totalItems,
          totalTax: 0,
          totalAmount,
          code,
          domainId,
          date: currentDate,
          productOrderCode: po.code,
          vendorId: invoice.vendorId,
          vendorName: invoice.vendorName,
          projectId: invoice.projectId,
        },
        grnProducts,
      );
    }

    // --- PO path ---
    if (data.referenceType === 'PO') {
      const vendor = await vendorRepository.findByIdAndDomain(
        data.vendorId,
        domainId,
      );
      if (!vendor) throw new Error('Vendor not found');

      const po =
        await RawMaterialPurchaseRequestRepository.findPurchaseOrderWithProducts(
          data.purchaseOrderId,
          domainId,
        );
      if (!po) throw new Error('Purchase Order not found');

      const grnProducts: any[] = [];
      for (const p of data.grnProducts) {
        const poItem = (po.purchaseOrderProducts || []).find(
          (item: any) => item.id === p.poProductId,
        );
        if (!poItem)
          throw new Error(
            `PO product ${p.poProductId} does not belong to the referenced PO`,
          );

        const product = await ProductRepository.findFirst({
          where: {
            displayName: { equals: poItem.productName },
            domainId,
            isDeleted: false,
          },
        });

        const productGrade =
          product && poItem.productGradeName
            ? await ProductGradeRepository.findFirst({
                where: {
                  gradeDisplayName: { equals: poItem.productGradeName },
                  productId: product.id,
                  domainId,
                  isDeleted: false,
                },
              })
            : null;

        grnProducts.push({
          material: toMaterialName(poItem.productName),
          productId: product?.id ?? null,
          productGradeId: productGrade?.id ?? null,
          quantity: p.quantity,
          tax: 0,
          rate: p.rate,
          currencyId: p.currencyId,
          uomId: poItem.uomId,
          projectId: po.projectId ?? null,
          invoiceId: null,
          vendor: vendor.name,
          date: currentDate,
        });
      }

      const totalItems = grnProducts.length;
      const totalAmount = grnProducts.reduce(
        (sum: number, p: any) => sum + p.quantity * p.rate,
        0,
      );

      return GrnRepository.create(
        {
          wbReference: data.wbReference,
          referenceType: 'PO',
          invoiceId: null,
          totalItems,
          totalTax: 0,
          totalAmount,
          code,
          domainId,
          date: currentDate,
          productOrderCode: po.code,
          vendorId: null,
          vendorName: vendor.name,
          projectId: po.projectId ?? null,
        },
        grnProducts,
      );
    }

    // --- NA path (standalone) ---
    const vendor = await vendorRepository.findByIdAndDomain(
      data.vendorId,
      domainId,
    );
    if (!vendor) throw new Error('Vendor not found');

    const grnProducts: any[] = [];
    for (const p of data.grnProducts) {
      const product = await ProductRepository.findByIdAndDomain(
        p.productId,
        domainId,
      );
      if (!product) throw new Error(`Product ${p.productId} not found`);

      grnProducts.push({
        material: toMaterialName(product.displayName),
        productId: product.id,
        productGradeId: p.productGradeId,
        quantity: p.quantity,
        tax: 0,
        rate: p.rate ?? 0,
        currencyId: p.currencyId,
        uomId: p.uomId,
        projectId: data.projectId ?? null,
        invoiceId: null,
        vendor: vendor.name,
        date: currentDate,
      });
    }

    const totalItems = grnProducts.length;
    const totalAmount = grnProducts.reduce(
      (sum: number, p: any) => sum + p.quantity * p.rate,
      0,
    );

    return GrnRepository.create(
      {
        wbReference: data.wbReference,
        referenceType: 'NA',
        invoiceId: null,
        totalItems,
        totalTax: 0,
        totalAmount,
        code,
        domainId,
        date: currentDate,
        productOrderCode: null,
        vendorId: null,
        vendorName: vendor.name,
        projectId: data.projectId ?? null,
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
      invoiceId?: string;
      referenceType?: string;
      [key: string]: any;
    },
    langCode?: string,
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
        invoiceId: query.invoiceId,
        referenceType: query.referenceType,
      },
    );

    return {
      grns: translateResponse(grns, langCode),
      pagination: { totalCount, offset, limit },
    };
  },

  async getGrnById(domainId: string, id: string) {
    const grn = await GrnRepository.findByIdWithDetails(id, domainId);
    if (!grn) throw new Error(Messages.GRN.NOT_FOUND);
    return grn;
  },

  async exportGrnExcel(domainId: string, id: string) {
    const grn: any = await GrnService.getGrnById(domainId, id);
    const detailsColumns = ['Field', 'Value'];
    const productColumns = [
      'Material',
      'Quantity',
      'UOM',
      'Rate',
      'Tax',
      'Amount',
      'Project',
      'Invoice',
      'Vendor',
      'Date',
      'Status',
    ];

    const detailRows = [
      { Field: 'GRN Code', Value: grn.code },
      { Field: 'Reference Type', Value: grn.referenceType },
      { Field: 'Waybill Reference', Value: grn.wbReference ?? '' },
      { Field: 'Product Order Code', Value: grn.productOrderCode ?? '' },
      { Field: 'Vendor', Value: grn.vendorName ?? '' },
      { Field: 'Project', Value: toDisplayString(grn.project?.name) },
      { Field: 'Invoice', Value: grn.invoice?.invoiceCode ?? '' },
      { Field: 'Date', Value: toDateString(grn.date) },
      { Field: 'Approval Status', Value: grn.approvalStatus },
      { Field: 'Status', Value: grn.status },
      { Field: 'Total Items', Value: grn.totalItems ?? 0 },
      { Field: 'Total Tax', Value: grn.totalTax ?? 0 },
      { Field: 'Total Amount', Value: grn.totalAmount ?? 0 },
    ];

    const productRows = (grn.grnProducts || []).map((product: any) => ({
      Material: product.material ?? '',
      Quantity: product.quantity ?? 0,
      UOM:
        product.uom?.code ??
        toDisplayString(product.uom?.displayName) ??
        product.uomId ??
        '',
      Rate: product.rate ?? 0,
      Tax: product.tax ?? 0,
      Amount: product.amt ?? (product.quantity ?? 0) * (product.rate ?? 0),
      Project:
        toDisplayString(product.project?.name) ||
        toDisplayString(grn.project?.name),
      Invoice: product.invoice?.invoiceCode ?? grn.invoice?.invoiceCode ?? '',
      Vendor: product.vendor ?? grn.vendorName ?? '',
      Date: toDateString(product.date),
      Status: product.status ?? '',
    }));

    return {
      filenamePrefix: `grn-${grn.code}`,
      worksheets: [
        { name: 'GRN Details', columns: detailsColumns, rows: detailRows },
        { name: 'GRN Products', columns: productColumns, rows: productRows },
      ] as GrnExcelWorksheet[],
    };
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
    if (!grn) throw new Error(Messages.GRN.NOT_FOUND);
    if (
      grn.approvalStatus !== ApprovalStatus.PENDING &&
      grn.approvalStatus !== ApprovalStatus.REJECTED
    ) {
      throw new Error(Messages.GRN.CANNOT_UPDATE_NON_PENDING);
    }

    const { grnProducts, ...grnData } = data;

    return transaction(async (tx) => {
      const updatedGrn = await GrnRepository.update(id, { ...grnData }, tx);

      if (grnProducts !== undefined) {
        const finalInvoice = updatedGrn.invoiceId
          ? ((await invoiceRepository.findFirst(
              { where: { id: updatedGrn.invoiceId, domainId } },
              tx,
            )) as any)
          : null;
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
            await GrnRepository.updateGrnProductRaw(
              p.id,
              { ...productData, isDeleted: false, status: 'ACTIVE' },
              tx,
            );
          } else {
            await GrnRepository.createGrnProductRaw(
              {
                ...productData,
                grnId: id,
                grnCode: updatedGrn.code,
                date: new Date(),
                vendor: finalVendor,
                projectId: finalProjectId,
                invoiceId: updatedGrn.invoiceId ?? null,
                domainId,
                status: 'ACTIVE',
              },
              tx,
            );
          }
        }

        await GrnRepository.recalculateGrnTotals(tx, id, domainId);
      }

      const res = await GrnRepository.findFirst(
        {
          where: { id },
          include: {
            project: true,
            invoice: true,
            grnProducts: {
              where: { isDeleted: false },
              include: { uom: true, project: true, invoice: true },
            },
          },
        },
        tx,
      );
      return GrnRepository.mapGrn(res);
    });
  },

  async deleteGrn(domainId: string, id: string) {
    const grn = await GrnRepository.findByIdAndDomain(id, domainId);
    if (!grn) throw new Error(Messages.GRN.NOT_FOUND);
    if (grn.approvalStatus === ApprovalStatus.APPROVED)
      throw new Error('Cannot delete an APPROVED GRN');
    return GrnRepository.softDelete(id);
  },

  async approveOrRejectGrn(
    domainId: string,
    id: string,
    approvalStatus: ApprovalStatus,
  ) {
    const grn = await GrnRepository.findByIdAndDomain(id, domainId);
    if (!grn) throw new Error(Messages.GRN.NOT_FOUND);
    if (grn.approvalStatus !== ApprovalStatus.PENDING)
      throw new Error(Messages.GRN.ALREADY_ACTIONED);

    if (approvalStatus === ApprovalStatus.APPROVED)
      return GrnRepository.approveAndUpdateInventory(id, domainId);

    return GrnRepository.reject(id);
  },

  async createGrnProduct(domainId: string, grnId: string, data: any) {
    const grn = await GrnRepository.findByIdAndDomain(grnId, domainId);
    if (!grn) throw new Error(Messages.GRN.NOT_FOUND);
    if (grn.approvalStatus === ApprovalStatus.APPROVED)
      throw new Error('Cannot add products to an approved GRN');

    return GrnRepository.createGrnProduct(grnId, domainId, {
      ...data,
      grnCode: grn.code,
      date: new Date(),
      vendor: grn.vendorName,
      projectId: grn.projectId,
      invoiceId: grn.invoiceId ?? null,
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
    if (grn.approvalStatus === ApprovalStatus.APPROVED)
      throw new Error('Cannot update products in an approved GRN');

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
    if (grn.approvalStatus === ApprovalStatus.APPROVED)
      throw new Error('Cannot delete products from an approved GRN');

    const product = await GrnRepository.getGrnProductById(
      productId,
      grnId,
      domainId,
    );
    if (!product) throw new Error('Product not found');

    return GrnRepository.deleteGrnProduct(productId, grnId, domainId);
  },
};
