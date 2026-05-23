import { Messages } from '../../../constants/index.js';
import { invoiceRepository } from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';

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

  async listInvoiceItems(domainId: string, invoiceId: string) {
    const invoice = await invoiceRepository.findByIdAndDomain(
      invoiceId,
      domainId,
    );
    if (!invoice) throw new Error(Messages.INVOICE.NOT_FOUND);
    return invoiceRepository.listItemsByInvoice(invoiceId, domainId);
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
};
