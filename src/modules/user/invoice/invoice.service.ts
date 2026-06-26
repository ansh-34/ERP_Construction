import { Messages } from '../../../constants/index.js';
import { invoiceRepository } from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { translateResponse } from '../../../utils/translation.js';
import { enqueuePdfGeneration } from '../../../queue/pdfQueue.js';
import { PdfStatus } from '../../../infra/database/prisma/generated/prisma/client/enums.js';
import { getSignedDownloadUrl } from '../../../utils/s3.utils.js';

export interface InvoiceExcelWorksheet {
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

export const InvoiceService = {
  generateInvoiceCode(domainId: string): string {
    const timestamp = Date.now();
    const suffix = domainId.slice(0, 4).toUpperCase();
    return `INV-${suffix}-${timestamp}`;
  },

  async listInvoices(
    authDomainId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      vendorName?: string;
      purchaseOrderId?: string;
      projectId?: string;
      [key: string]: any;
    },
    langCode?: string,
  ) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, invoices] = await invoiceRepository.listByDomain(
      authDomainId,
      limit,
      offset,
      {
        status: query.status,
        searchKey: query.searchKey,
        vendorName: query.vendorName,
        purchaseOrderId: query.purchaseOrderId,
        projectId: query.projectId,
        // Default to FINAL + ACTIVE; override with ?invoiceType / ?lifecycle.
        invoiceType: query.invoiceType ?? 'FINAL',
        lifecycle: query.lifecycle ?? 'ACTIVE',
      },
    );

    return {
      invoices: translateResponse(invoices, langCode),
      pagination: { totalCount, offset, limit },
    };
  },

  async listActiveInvoices(
    authDomainId: string,
    query: Record<string, any>,
    langCode?: string,
  ) {
    return InvoiceService.listInvoices(
      authDomainId,
      { ...query, lifecycle: 'ACTIVE' },
      langCode,
    );
  },

  async getInvoiceById(
    domainId: string,
    id: string,
    query?: {
      invoiceType?: 'PROFORMA' | 'FINAL';
      lifecycle?: 'ACTIVE' | 'VOID';
    },
  ) {
    const invoice: any = await invoiceRepository.findByIdAndDomain(
      id,
      domainId,
      {
        // Default to FINAL + ACTIVE; override with ?invoiceType / ?lifecycle.
        invoiceType: query?.invoiceType ?? 'FINAL',
        lifecycle: query?.lifecycle ?? 'ACTIVE',
      },
    );
    if (!invoice) throw new Error(Messages.INVOICE.NOT_FOUND);
    if (invoice.pdfStatus === PdfStatus.READY && invoice.pdfUrl) {
      invoice.pdfUrl =
        (await getSignedDownloadUrl(invoice.pdfUrl)) ?? invoice.pdfUrl;
    }

    return invoice;
  },

  async exportInvoiceExcel(domainId: string, id: string) {
    const invoice: any = await InvoiceService.getInvoiceById(domainId, id);
    const detailsColumns = ['Field', 'Value'];
    const itemColumns = [
      'Product',
      'Product Code',
      'Grade',
      'Grade Code',
      'Description',
      'Quantity',
      'UOM',
      'Rate',
      'Rate Difference',
      'Tax Amount',
      'Discount',
      'Total Amount',
    ];

    const detailRows = [
      { Field: 'Invoice Code', Value: invoice.invoiceCode },
      { Field: 'Vendor', Value: invoice.vendorName ?? '' },
      { Field: 'Project', Value: toDisplayString(invoice.project?.name) },
      { Field: 'Project Code', Value: invoice.project?.code ?? '' },
      { Field: 'Purchase Order', Value: invoice.purchaseOrder?.code ?? '' },
      { Field: 'Invoice Date', Value: toDateString(invoice.invoiceDate) },
      { Field: 'Due Date', Value: toDateString(invoice.dueDate) },
      { Field: 'Invoice Type', Value: invoice.invoiceType ?? '' },
      { Field: 'Lifecycle', Value: invoice.lifecycle ?? '' },
      { Field: 'Payment Status', Value: invoice.paymentStatus ?? '' },
      { Field: 'PDF Status', Value: invoice.pdfStatus ?? '' },
      { Field: 'Status', Value: invoice.status ?? '' },
      { Field: 'Total Items', Value: invoice.totalItems ?? 0 },
      { Field: 'Total Tax', Value: invoice.totalTax ?? 0 },
      { Field: 'Total Amount', Value: invoice.totalAmount ?? 0 },
      { Field: 'Total GRNs', Value: invoice.totalGrns ?? 0 },
      {
        Field: 'Total Items Received',
        Value: invoice.totalItemsReceived ?? 0,
      },
      { Field: 'Last GRN Date', Value: toDateString(invoice.lastGrnDate) },
    ];

    const itemRows = (invoice.items || []).map((item: any) => ({
      Product: toDisplayString(item.product?.displayName),
      'Product Code': item.product?.code ?? '',
      Grade: toDisplayString(item.productGrade?.gradeDisplayName),
      'Grade Code': item.productGrade?.gradeCode ?? '',
      Description: item.description ?? '',
      Quantity: item.quantity ?? 0,
      UOM: item.uom?.code ?? toDisplayString(item.uom?.displayName),
      Rate: item.rate ?? 0,
      'Rate Difference': item.rateDifference ?? 0,
      'Tax Amount': item.taxAmount ?? 0,
      Discount: item.discount ?? 0,
      'Total Amount': item.totalAmount ?? 0,
    }));

    return {
      filenamePrefix: `invoice-${invoice.invoiceCode}`,
      worksheets: [
        { name: 'Invoice Details', columns: detailsColumns, rows: detailRows },
        { name: 'Invoice Items', columns: itemColumns, rows: itemRows },
      ] as InvoiceExcelWorksheet[],
    };
  },

  async getActiveInvoiceById(domainId: string, id: string) {
    const invoice: any = await invoiceRepository.findByIdAndDomain(
      id,
      domainId,
      {
        lifecycle: 'ACTIVE',
      },
    );
    if (!invoice) throw new Error(Messages.INVOICE.NOT_FOUND);
    if (invoice.pdfStatus === PdfStatus.READY && invoice.pdfUrl) {
      invoice.pdfUrl =
        (await getSignedDownloadUrl(invoice.pdfUrl)) ?? invoice.pdfUrl;
    }

    return invoice;
  },

  async deleteInvoice(domainId: string, id: string) {
    const invoice = await invoiceRepository.findByIdAndDomain(id, domainId);
    if (!invoice) throw new Error(Messages.INVOICE.NOT_FOUND);
    return invoiceRepository.softDelete(id);
  },

  async listInvoiceItems(
    domainId: string,
    invoiceId: string,
    langCode?: string,
  ) {
    const invoice = await invoiceRepository.findByIdAndDomain(
      invoiceId,
      domainId,
    );
    if (!invoice) throw new Error(Messages.INVOICE.NOT_FOUND);
    const items = await invoiceRepository.listItemsByInvoice(
      invoiceId,
      domainId,
    );
    return translateResponse(items, langCode);
  },

  async generateFromPurchaseOrder(
    domainId: string,
    poId: string,
    requestedBy: string,
    assignments: {
      purchaseOrderProductId: string;
      vendorProductPricingId: string;
    }[],
  ) {
    const result = await invoiceRepository.generateFromPurchaseOrder(
      poId,
      domainId,
      requestedBy,
      assignments,
    );

    return result.invoices;
  },

  async finalizeInvoice(
    domainId: string,
    proformaId: string,
    requestedBy: string,
    payload: {
      items: {
        productId: string;
        productGradeId?: string | null;
        uomId: string;
        quantity: number;
        rate: number;
      }[];
    },
  ) {
    return invoiceRepository.finalizeInvoice(
      proformaId,
      domainId,
      requestedBy,
      payload,
    );
  },

  async listAllInvoiceItems(
    domainId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      invoiceId?: string;
      searchKey?: string;
    },
    langCode?: string | undefined,
  ) {
    const { offset, limit } = normalizePagination(query);
    const { invoiceId, searchKey } = query;

    const [totalCount, items] = await invoiceRepository.listInvoiceItems(
      limit,
      offset,
      {
        filters: {
          invoiceId,
          searchKey,
          domainId,
        },
      },
    );

    return {
      items: translateResponse(items, langCode),
      pagination: { totalCount, currentCount: items.length, offset, limit },
    };
  },

  async requestPdf(domainId: string, id: string) {
    const invoice: any = await invoiceRepository.findByIdAndDomain(
      id,
      domainId,
    );
    if (!invoice) throw new Error(Messages.INVOICE.NOT_FOUND);

    const STALE_IN_FLIGHT_MS = 5 * 60 * 1000;
    const lastUpdated = invoice.updatedAt
      ? new Date(invoice.updatedAt).getTime()
      : 0;
    const isStale = Date.now() - lastUpdated > STALE_IN_FLIGHT_MS;

    const inFlight =
      invoice.pdfStatus === PdfStatus.PENDING ||
      invoice.pdfStatus === PdfStatus.PROCESSING;
    if (inFlight && !isStale) {
      return { pdfStatus: invoice.pdfStatus };
    }

    await invoiceRepository.update(id, { pdfStatus: PdfStatus.PENDING });
    await enqueuePdfGeneration(id);

    return { pdfStatus: PdfStatus.PENDING };
  },

  async getPdfStatus(domainId: string, id: string) {
    const invoice: any = await invoiceRepository.findByIdAndDomain(
      id,
      domainId,
    );
    if (!invoice) throw new Error(Messages.INVOICE.NOT_FOUND);

    let downloadUrl: string | null = null;
    if (invoice.pdfStatus === PdfStatus.READY && invoice.pdfUrl) {
      downloadUrl = await getSignedDownloadUrl(invoice.pdfUrl);
    }

    return {
      pdfStatus: invoice.pdfStatus,
      pdfUrl: invoice.pdfUrl,
      downloadUrl,
      pdfGeneratedAt: invoice.pdfGeneratedAt,
    };
  },
};
