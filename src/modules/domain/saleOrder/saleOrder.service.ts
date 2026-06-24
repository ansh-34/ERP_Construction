import { Messages } from '../../../constants/index.js';
import {
  saleOrderRepository,
  customerRepository,
} from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';

function localizeName(value: unknown, lang: string): string {
  if (typeof value === 'object' && value !== null) {
    const map = value as Record<string, string>;
    return map[lang] ?? map.en ?? '';
  }
  return '';
}

function normalizeOrderProduct(p: any, lang: string | null) {
  const name = (v: unknown) => (lang !== null ? localizeName(v, lang) : v);
  return {
    ...p,
    product: p.product
      ? {
          id: p.product.id,
          code: p.product.code,
          name: name(p.product.displayName),
        }
      : null,
    productGrade: p.productGrade
      ? {
          id: p.productGrade.id,
          gradeCode: p.productGrade.gradeCode,
          name: name(p.productGrade.gradeDisplayName),
        }
      : null,
    uom: p.uom
      ? { id: p.uom.id, code: p.uom.code, name: name(p.uom.displayName) }
      : null,
  };
}

function normalizeOrder(order: any, lang: string | null) {
  return {
    ...order,
    saleOrderProducts: (order.saleOrderProducts ?? []).map((p: any) =>
      normalizeOrderProduct(p, lang),
    ),
  };
}

type SaleOrderProductDto = {
  productId: string;
  productGradeId?: string;
  quantity: number;
  uomId: string;
  unitRate: number;
  taxAmount: number;
  transportationCharge: number;
  royaltyAmount: number;
};

type SaleOrderDto = {
  ticketNumber?: string;
  date?: string;
  entryType?: 'PLANT_ENTRY' | 'MANUAL';
  customerId: string;
  paymentType?: 'CASH' | 'CREDIT';
  orderStatus?: 'PENDING' | 'INPROGRESS' | 'INVOICED';
  remarks?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  products: SaleOrderProductDto[];
};

async function generateTicketNumber(domainId: string): Promise<string> {
  const rows = await saleOrderRepository.getTicketNumbers(domainId);
  const maxNum = rows.reduce((max, row) => {
    const m = row.ticketNumber.match(/^TK-(\d+)$/);
    return m ? Math.max(max, parseInt(m[1], 10)) : max;
  }, 0);
  return `TK-${String(maxNum + 1).padStart(4, '0')}`;
}

export const SaleOrderService = {
  async create(domainId: string, adminId: string, dto: SaleOrderDto) {
    const customer = await customerRepository.findByIdAndDomain(
      dto.customerId,
      domainId,
      adminId,
    );
    if (!customer) throw new Error('Customer not found');

    const ticketNumber =
      dto.ticketNumber ?? (await generateTicketNumber(domainId));

    const totalAmount = dto.products.reduce(
      (s, p) => s + p.unitRate * p.quantity,
      0,
    );
    const totalTaxAmount = dto.products.reduce((s, p) => s + p.taxAmount, 0);
    const totalTransportationCharges = dto.products.reduce(
      (s, p) => s + p.transportationCharge,
      0,
    );
    const totalRoyaltyCharges = dto.products.reduce(
      (s, p) => s + p.royaltyAmount,
      0,
    );

    return saleOrderRepository.createWithProducts(
      {
        ticketNumber,
        date: dto.date ? new Date(dto.date) : new Date(),
        entryType: dto.entryType ?? 'MANUAL',
        customerId: customer.id,
        customerName: customer.name,
        customerPhone:
          [customer.phoneCode, customer.phone].filter(Boolean).join('') || '',
        totalAmount,
        totalTaxAmount,
        totalTransportationCharges,
        totalRoyaltyCharges,
        paymentType: dto.paymentType ?? 'CASH',
        orderStatus: dto.orderStatus ?? 'PENDING',
        remarks: dto.remarks ?? null,
        status: dto.status ?? 'ACTIVE',
        domainId,
        adminId,
        isDeleted: false,
      },
      dto.products.map((p) => ({
        ...p,
        productGradeId: p.productGradeId ?? null,
        domainId,
        adminId,
      })),
    );
  },

  async findAll(
    domainId: string,
    adminId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: 'ACTIVE' | 'INACTIVE';
      orderStatus?: string;
      paymentType?: string;
      customerId?: string;
      searchKey?: string;
    },
    lang?: string | null,
  ) {
    const { offset, limit } = normalizePagination(query);
    const [totalCount, data] = await saleOrderRepository.listByDomain(
      domainId,
      adminId,
      limit,
      offset,
      {
        status: query.status,
        orderStatus: query.orderStatus,
        paymentType: query.paymentType,
        customerId: query.customerId,
        searchKey: query.searchKey,
      },
    );
    return {
      data: data.map((r: any) => normalizeOrder(r, lang ?? null)),
      pagination: { totalCount, offset, limit },
    };
  },

  async findOne(
    domainId: string,
    adminId: string,
    id: string,
    lang: string = 'en',
  ) {
    const saleOrder = await saleOrderRepository.findByIdAndDomain(
      id,
      domainId,
      adminId,
    );
    if (!saleOrder) throw new Error(Messages.SALE_ORDER.NOT_FOUND);
    return normalizeOrder(saleOrder, lang);
  },

  async update(
    domainId: string,
    adminId: string,
    id: string,
    dto: Partial<Omit<SaleOrderDto, 'products'>> & {
      products?: SaleOrderProductDto[];
    },
  ) {
    const existing = await saleOrderRepository.findByIdAndDomain(
      id,
      domainId,
      adminId,
    );
    if (!existing) throw new Error(Messages.SALE_ORDER.NOT_FOUND);

    let customer: any;
    if (dto.customerId !== undefined) {
      customer = await customerRepository.findByIdAndDomain(
        dto.customerId,
        domainId,
        adminId,
      );
      if (!customer) throw new Error('Customer not found');
    }

    const orderData: any = {};
    if (dto.ticketNumber !== undefined)
      orderData.ticketNumber = dto.ticketNumber;
    if (dto.date !== undefined) orderData.date = new Date(dto.date);
    if (dto.entryType !== undefined) orderData.entryType = dto.entryType;
    if (customer) {
      orderData.customerId = customer.id;
      orderData.customerName = customer.name;
      orderData.customerPhone =
        [customer.phoneCode, customer.phone].filter(Boolean).join('') || '';
    }
    if (dto.paymentType !== undefined) orderData.paymentType = dto.paymentType;
    if (dto.orderStatus !== undefined) orderData.orderStatus = dto.orderStatus;
    if (dto.remarks !== undefined) orderData.remarks = dto.remarks;
    if (dto.status !== undefined) orderData.status = dto.status;

    const products = dto.products?.map((p) => ({
      ...p,
      productGradeId: p.productGradeId ?? null,
      domainId,
      adminId,
    }));

    return saleOrderRepository.updateWithProducts(id, orderData, products);
  },

  async listProducts(
    domainId: string,
    adminId: string,
    saleOrderId: string,
    lang: string = 'en',
  ) {
    const saleOrder = await saleOrderRepository.findByIdAndDomain(
      saleOrderId,
      domainId,
      adminId,
    );
    if (!saleOrder) throw new Error(Messages.SALE_ORDER.NOT_FOUND);
    const products = (saleOrder as any).saleOrderProducts ?? [];
    return products.map((p: any) => normalizeOrderProduct(p, lang));
  },

  async removeProduct(
    domainId: string,
    adminId: string,
    saleOrderId: string,
    productLineId: string,
  ) {
    const order = await saleOrderRepository.findByIdAndDomain(
      saleOrderId,
      domainId,
      adminId,
    );
    if (!order) throw new Error(Messages.SALE_ORDER.NOT_FOUND);
    const line = await saleOrderRepository.findProductLine(
      productLineId,
      saleOrderId,
    );
    if (!line) throw new Error(Messages.SALE_ORDER.PRODUCT_NOT_FOUND);
    return saleOrderRepository.deleteProductLine(productLineId);
  },

  async softDelete(domainId: string, adminId: string, id: string) {
    const saleOrder = await saleOrderRepository.findByIdAndDomain(
      id,
      domainId,
      adminId,
    );
    if (!saleOrder) throw new Error(Messages.SALE_ORDER.NOT_FOUND);
    if ((saleOrder as any).orderStatus === 'INVOICED') {
      throw new Error(Messages.SALE_ORDER.CANNOT_DELETE_INVOICED);
    }
    return saleOrderRepository.softDelete(id);
  },
};
