import {
  customerPaymentRepository,
  customerRepository,
} from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { normalizePrismaError } from '../../../utils/prismaError.js';

type CustomerPaymentDto = {
  customerId: string;
  paidDate: Date | string;
  amount: number;
  roundOffAmount?: number;
  paymentType?: 'CASH';
  cashLedgerId?: string | null;
  remarks?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
};

const buildSearchText = (dto: {
  paymentType?: string | null;
  cashLedgerId?: string | null;
  remarks?: string | null;
  amount?: number | null;
  roundOffAmount?: number | null;
}) =>
  [
    dto.paymentType,
    dto.cashLedgerId,
    dto.remarks,
    dto.amount,
    dto.roundOffAmount,
  ]
    .filter((value) => value !== undefined && value !== null && value !== '')
    .join(' ')
    .toLowerCase();

const normalizeDate = (date: Date | string) => {
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('invalid date');
  }
  return parsed;
};

async function assertCustomer(
  domainId: string,
  adminId: string,
  customerId: string,
) {
  const customer = await customerRepository.findByIdAndDomain(
    customerId,
    domainId,
    adminId,
  );

  if (!customer || customer.status !== 'ACTIVE') {
    throw new Error('customer not found');
  }
}

async function calculateOutstandingAmount(
  domainId: string,
  adminId: string,
  customerId: string,
  amount: number,
  roundOffAmount: number,
  excludeId?: string,
) {
  const latestPayment = await customerPaymentRepository.findLatestByCustomer(
    customerId,
    domainId,
    adminId,
    excludeId,
  );
  const previousOutstanding = Number(latestPayment?.outstandingAmount ?? 0);
  return Math.max(previousOutstanding - amount - roundOffAmount, 0);
}

export const CustomerPaymentService = {
  async create(
    domainId: string,
    adminId: string,
    createdBy: string | undefined,
    dto: CustomerPaymentDto,
  ) {
    try {
      await assertCustomer(domainId, adminId, dto.customerId);

      const amount = Number(dto.amount);
      const roundOffAmount = Number(dto.roundOffAmount ?? 0);
      const paymentType = dto.paymentType ?? 'CASH';
      const outstandingAmount = await calculateOutstandingAmount(
        domainId,
        adminId,
        dto.customerId,
        amount,
        roundOffAmount,
      );

      return await customerPaymentRepository.create({
        customerId: dto.customerId,
        paidDate: normalizeDate(dto.paidDate),
        amount,
        outstandingAmount,
        roundOffAmount,
        paymentType,
        cashLedgerId: dto.cashLedgerId ?? undefined,
        remarks: dto.remarks ?? undefined,
        searchText: buildSearchText({
          paymentType,
          cashLedgerId: dto.cashLedgerId,
          remarks: dto.remarks,
          amount,
          roundOffAmount,
        }),
        createdBy,
        domainId,
        adminId,
        status: dto.status ?? 'ACTIVE',
        isDeleted: false,
      });
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async list(
    domainId: string,
    adminId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      customerId?: string;
      paymentType?: 'CASH';
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      fromDate?: Date;
      toDate?: Date;
    },
  ) {
    try {
      const { offset, limit } = normalizePagination(query);
      const [totalCount, data] = await customerPaymentRepository.listByDomain(
        domainId,
        adminId,
        limit,
        offset,
        {
          customerId: query.customerId,
          paymentType: query.paymentType,
          status: query.status,
          searchKey: query.searchKey,
          fromDate: query.fromDate,
          toDate: query.toDate,
        },
      );

      return { data, pagination: { totalCount, offset, limit } };
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async getById(domainId: string, adminId: string, id: string) {
    try {
      const payment = await customerPaymentRepository.findByIdAndDomain(
        id,
        domainId,
        adminId,
      );

      if (!payment) throw new Error('customer payment not found');
      return payment;
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async update(
    domainId: string,
    adminId: string,
    id: string,
    dto: Partial<CustomerPaymentDto>,
  ) {
    try {
      const existing = await CustomerPaymentService.getById(
        domainId,
        adminId,
        id,
      );

      const customerId = dto.customerId ?? existing.customerId;
      if (dto.customerId && dto.customerId !== existing.customerId) {
        await assertCustomer(domainId, adminId, dto.customerId);
      }

      const amount =
        dto.amount !== undefined ? Number(dto.amount) : Number(existing.amount);
      const roundOffAmount =
        dto.roundOffAmount !== undefined
          ? Number(dto.roundOffAmount)
          : Number(existing.roundOffAmount);
      const paymentType = dto.paymentType ?? existing.paymentType;
      const cashLedgerId =
        dto.cashLedgerId === undefined
          ? existing.cashLedgerId
          : dto.cashLedgerId;
      const remarks =
        dto.remarks === undefined ? existing.remarks : dto.remarks;
      const outstandingAmount = await calculateOutstandingAmount(
        domainId,
        adminId,
        customerId,
        amount,
        roundOffAmount,
        id,
      );

      return await customerPaymentRepository.update(id, {
        ...(dto.customerId !== undefined && { customerId }),
        ...(dto.paidDate !== undefined && {
          paidDate: normalizeDate(dto.paidDate),
        }),
        ...(dto.amount !== undefined && { amount }),
        outstandingAmount,
        ...(dto.roundOffAmount !== undefined && { roundOffAmount }),
        ...(dto.paymentType !== undefined && { paymentType }),
        ...(dto.cashLedgerId !== undefined && { cashLedgerId }),
        ...(dto.remarks !== undefined && { remarks }),
        ...(dto.status !== undefined && { status: dto.status }),
        searchText: buildSearchText({
          paymentType,
          cashLedgerId,
          remarks,
          amount,
          roundOffAmount,
        }),
      });
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },

  async delete(domainId: string, adminId: string, id: string) {
    try {
      await CustomerPaymentService.getById(domainId, adminId, id);
      return await customerPaymentRepository.softDelete(id);
    } catch (error) {
      throw normalizePrismaError(error);
    }
  },
};
