import { Messages } from '../../../constants/index.js';
import { PaymentRequestRepository } from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import prisma from '../../../infra/database/prisma/prisma.client.js';

const ensureRelationsBelongToDomain = async (
  domainId: string,
  data: {
    projectId?: string;
    vendorId?: string;
  },
) => {
  if (data.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, domainId, isDeleted: false },
    });
    if (!project) throw new Error('Project not found');
  }

  if (data.vendorId) {
    const vendor = await prisma.vendorProductPricing.findFirst({
      where: { id: data.vendorId, domainId, isDeleted: false },
    });
    if (!vendor) throw new Error('Vendor not found');
  }
};

export const PaymentRequestService = {
  generateCode(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `PR-${dd}${mm}${yyyy}${hh}${min}${ss}${ms}`;
  },

  async createPaymentRequest(
    domainId: string,
    requestedBy: string,
    data: {
      date: string;
      type: string;
      vendorId: string;
      projectId: string;
      referenceNumber?: string;
      tds: number;
      grossAmount: number;
      netPayable: number;
      notes?: string;
      paymentStatus?: string;
      status?: 'ACTIVE' | 'INACTIVE';
    },
  ) {
    await ensureRelationsBelongToDomain(domainId, {
      projectId: data.projectId,
      vendorId: data.vendorId,
    });

    const code = PaymentRequestService.generateCode();

    const prData = {
      ...data,
      code,
      date: data.date ? new Date(data.date) : new Date(),
      requestedBy,
      domainId,
      status: data.status || 'ACTIVE',
      isDeleted: false,
    };

    return PaymentRequestRepository.create(prData);
  },

  async listPaymentRequests(
    authDomainId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      paymentStatus?: string;
      projectId?: string;
      vendorId?: string;
      domainId?: string;
      isDeleted?: boolean;
      [key: string]: any;
    },
  ) {
    if (query.domainId && query.domainId !== authDomainId) {
      throw new Error('domainId does not match authenticated domain');
    }

    const { offset, limit } = normalizePagination(query);

    const [totalCount, paymentRequests] =
      await PaymentRequestRepository.listByDomain(authDomainId, limit, offset, {
        status: query.status,
        searchKey: query.searchKey,
        paymentStatus: query.paymentStatus,
        projectId: query.projectId,
        vendorId: query.vendorId,
        isDeleted: query.isDeleted,
      });

    return {
      paymentRequests,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async getPaymentRequestById(domainId: string, id: string) {
    const pr = await PaymentRequestRepository.findByIdWithDetails(id, domainId);
    if (!pr) {
      throw new Error(Messages.PAYMENT_REQUEST.NOT_FOUND);
    }
    return pr;
  },

  async updatePaymentRequest(
    domainId: string,
    id: string,
    data: {
      date?: string;
      type?: string;
      vendorId?: string;
      projectId?: string;
      referenceNumber?: string;
      tds?: number;
      grossAmount?: number;
      netPayable?: number;
      notes?: string;
      paymentStatus?: string;
      status?: 'ACTIVE' | 'INACTIVE';
    },
  ) {
    const existing = await PaymentRequestRepository.findByIdAndDomain(
      id,
      domainId,
    );
    if (!existing) {
      throw new Error(Messages.PAYMENT_REQUEST.NOT_FOUND);
    }

    await ensureRelationsBelongToDomain(domainId, {
      projectId: data.projectId,
      vendorId: data.vendorId,
    });

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    return PaymentRequestRepository.update(id, updateData);
  },

  async deletePaymentRequest(domainId: string, id: string) {
    const existing = await PaymentRequestRepository.findByIdAndDomain(
      id,
      domainId,
    );
    if (!existing) {
      throw new Error(Messages.PAYMENT_REQUEST.NOT_FOUND);
    }

    return PaymentRequestRepository.softDelete(id);
  },
};
