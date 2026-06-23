import { Messages } from '../../../constants/index.js';
import {
  PaymentRequestRepository,
  projectRepository,
  vendorProductPriceRepository,
  UserRepository,
} from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';

const ensureRelationsBelongToDomain = async (
  domainId: string,
  data: {
    projectId?: string;
    vendorId?: string;
  },
) => {
  if (data.projectId) {
    const project = await projectRepository.findById(data.projectId, domainId);
    if (!project) throw new Error('Project not found');
  }

  if (data.vendorId) {
    const vendor = await vendorProductPriceRepository.findByIdAndDomain(
      data.vendorId,
      domainId,
    );
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

    // requestedBy is an FK to User. When a domain owner (whose token id is the
    // domain, not a User) creates the request, store null instead of failing.
    const requester = await UserRepository.findActiveById(
      requestedBy,
      domainId,
    );

    const prData = {
      ...data,
      code,
      date: data.date ? new Date(data.date) : new Date(),
      requestedBy: requester ? requestedBy : null,
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
        // Default to FINAL + ACTIVE; override with ?type / ?lifecycle.
        type: query.type ?? 'FINAL',
        lifecycle: query.lifecycle ?? 'ACTIVE',
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

  async listActivePaymentRequests(
    authDomainId: string,
    query: Record<string, any>,
  ) {
    return PaymentRequestService.listPaymentRequests(authDomainId, {
      ...query,
      lifecycle: 'ACTIVE',
    });
  },

  async getPaymentRequestById(
    domainId: string,
    id: string,
    query?: { type?: string; lifecycle?: 'ACTIVE' | 'VOID' },
  ) {
    const pr = await PaymentRequestRepository.findByIdWithDetails(
      id,
      domainId,
      {
        // Default to FINAL + ACTIVE; override with ?type / ?lifecycle.
        type: query?.type ?? 'FINAL',
        lifecycle: query?.lifecycle ?? 'ACTIVE',
      },
    );
    if (!pr) {
      throw new Error(Messages.PAYMENT_REQUEST.NOT_FOUND);
    }
    return pr;
  },

  async getActivePaymentRequestById(domainId: string, id: string) {
    const pr = await PaymentRequestRepository.findByIdWithDetails(
      id,
      domainId,
      {
        lifecycle: 'ACTIVE',
      },
    );
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
