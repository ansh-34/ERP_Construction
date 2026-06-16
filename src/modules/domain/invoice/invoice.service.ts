import { Messages } from '../../../constants/index.js';
import { invoiceRepository } from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { translateResponse } from '../../../utils/translation.js';
import { enqueuePdfGeneration } from '../../../queue/pdfQueue.js';
import { PdfStatus } from '../../../infra/database/prisma/generated/prisma/client/enums.js';
import { getSignedDownloadUrl } from '../../../utils/s3.utils.js';

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
      },
    );

    return {
      invoices,
      pagination: { totalCount, offset, limit },
    };
  },

  async getInvoiceById(domainId: string, id: string) {
    const invoice = await invoiceRepository.findByIdAndDomain(id, domainId);
    if (!invoice) throw new Error(Messages.INVOICE.NOT_FOUND);
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
    assignments: {
      purchaseOrderProductId: string;
      vendorProductPricingId: string;
    }[],
  ) {
    return invoiceRepository.generateFromPurchaseOrder(
      poId,
      domainId,
      assignments,
    );
  },

  // Enqueue background PDF generation for an invoice. Idempotent: if a job is
  // already pending/processing it returns the current status without re-queuing.
  async requestPdf(domainId: string, id: string) {
    const invoice: any = await invoiceRepository.findByIdAndDomain(
      id,
      domainId,
    );
    if (!invoice) throw new Error(Messages.INVOICE.NOT_FOUND);

    if (invoice.pdfStatus === PdfStatus.PROCESSING) {
      return { pdfStatus: invoice.pdfStatus };
    }

    await invoiceRepository.update(id, { pdfStatus: PdfStatus.PROCESSING });
    await enqueuePdfGeneration(id);

    return { pdfStatus: PdfStatus.PROCESSING };
  },

  async getPdfStatus(domainId: string, id: string) {
    const invoice: any = await invoiceRepository.findByIdAndDomain(
      id,
      domainId,
    );
    if (!invoice) throw new Error(Messages.INVOICE.NOT_FOUND);

    // Presigned download link so the PDF can be fetched back from S3 even when
    // the bucket/object is private. Valid for 1 hour.
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
