import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import prisma from '../infra/database/prisma/prisma.client.js';
import { randomUUID } from 'crypto';

export const vendorProductPriceRepository = {
  create(data: Prisma.VendorProductPricingUncheckedCreateInput) {
    return prisma.vendorProductPricing.create({ data });
  },

  createMany(data: Prisma.VendorProductPricingUncheckedCreateInput[]) {
    return prisma.vendorProductPricing.createMany({
      data,
      skipDuplicates: true,
    });
  },

  findUnique(
    vendorName: string,
    productId: string,
    productGradeId: string,
    uomId: string,
    domainId: string,
  ) {
    return prisma.vendorProductPricing.findFirst({
      where: {
        vendor: {
          name: vendorName,
        },
        productId,
        productGradeId,
        uomId,
        domainId,
        isDeleted: false,
      },
    });
  },

  listByDomain(
    domainId: string,
    limit: number,
    offset: number,
    options: {
      filters?: {
        status?: 'ACTIVE' | 'INACTIVE';
        searchKey?: string;
        productId?: string;
        productCode?: string;
        productGradeId?: string;
        currencyId?: string;
        vendorId?: string;
      };
      select?: any;
    } = {},
  ) {
    const searchKey = options.filters?.searchKey?.trim() || '';
    const where: Prisma.VendorProductPricingWhereInput = {
      domainId,
      isDeleted: false,
      ...(options.filters?.status && { status: options.filters.status }),
      ...(searchKey && {
        OR: [
          { vendor: { name: { contains: searchKey, mode: 'insensitive' } } },
          { searchText: { contains: searchKey, mode: 'insensitive' } },
        ],
      }),
      ...(options.filters?.productId && {
        productId: options.filters.productId,
      }),
      ...(options.filters?.productCode && {
        product: { code: options.filters.productCode },
      }),
      ...(options.filters?.productGradeId && {
        productGradeId: options.filters.productGradeId,
      }),
      ...(options.filters?.currencyId && {
        currencyId: options.filters.currencyId,
      }),
      ...(options.filters?.vendorId && {
        vendorId: options.filters.vendorId,
      }),
    };

    return prisma.$transaction([
      prisma.vendorProductPricing.count({ where }),
      prisma.vendorProductPricing.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        ...(options.select && { select: options.select }),
      }),
    ]);
  },

  findByIdAndDomain(id: string, domainId: string, options?: { select?: any }) {
    return prisma.vendorProductPricing.findFirst({
      where: { id, domainId, isDeleted: false },
      ...(options && { select: options.select }),
    });
  },

  update(id: string, data: Prisma.VendorProductPricingUncheckedUpdateInput) {
    return prisma.vendorProductPricing.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.vendorProductPricing.update({
      where: { id },
      data: { isDeleted: true, status: 'INACTIVE' },
    });
  },

  async findAllByDomain(
    domainId: string,
    options: {
      filters?: { searchKey?: any; status?: any; key?: any; ids?: string[] };
      select?: any;
    } = {},
  ) {
    const whereClause: any = {
      domainId,
      isDeleted: false,
      ...(options.filters && {
        ...(options.filters.searchKey && {
          searchText: {
            contains: options.filters.searchKey.trim(),
            mode: Prisma.QueryMode.insensitive,
          },
        }),
        ...(options.filters.status && { status: options.filters.status }),
        ...(options.filters.key && { key: options.filters.key }),
        ...(options.filters.ids && { id: { in: options.filters.ids } }),
      }),
    };
    return await Promise.all([
      prisma.vendorProductPricing.count({ where: whereClause }),
      prisma.vendorProductPricing.findMany({
        where: whereClause,
        ...(options.select && { select: options.select }),
      }),
    ]);
  },

  async bulkUpsert(
    domainId: string,
    adminId: string,
    pricingData: {
      vendorId: string;
      productId: string;
      productGradeId: string;
      uomId: string;
      currencyId: string;
      price: number;
      status: 'ACTIVE' | 'INACTIVE';
      searchText: string;
      key: string;
    }[],
  ) {
    if (!pricingData.length) {
      return { count: 0 };
    }

    const values = pricingData.map(
      (item) =>
        Prisma.sql`(
        ${randomUUID()}::uuid,
        ${domainId}::uuid,
        ${adminId}::uuid,
        ${item.vendorId}::uuid,
        ${item.productId}::uuid,
        ${item.productGradeId}::uuid,
        ${item.uomId}::uuid,
        ${item.price}::double precision,
        ${item.currencyId}::uuid,
        ${item.status}::"StatusEnum",
        ${item.searchText},
        ${item.key},
        false,
        NOW(),
        NOW()
      )`,
    );

    return prisma.$executeRaw`
  INSERT INTO "VendorProductPricing" (
    "id",
    "domainId",
    "adminId",
    "vendorId",
    "productId",
    "productGradeId",
    "uomId",
    "price",
    "currencyId",
    "status",
    "searchText",
    "key",
    "isDeleted",
    "createdAt",
    "updatedAt"
  )
  VALUES ${Prisma.join(values)}
  ON CONFLICT (
    "key",
    "isDeleted"
  )
  DO UPDATE SET
    "price" = EXCLUDED."price",
    "currencyId" = EXCLUDED."currencyId",
    "status" = EXCLUDED."status",
    "searchText" = EXCLUDED."searchText",
    "isDeleted" = false,
    "updatedAt" = NOW()
`;
  },

  async validateVendorProductPriceIds(domainId: string, ids: string[]) {
    const count = await prisma.vendorProductPricing.count({
      where: { domainId, id: { in: ids }, isDeleted: false },
    });
    return count === ids.length;
  },

  async validateUniqueKeys(
    domainId: string,
    keys: string[],
    excludeIds: string[],
  ) {
    const count = await prisma.vendorProductPricing.count({
      where: {
        domainId,
        key: {
          in: keys,
        },
        id: {
          notIn: excludeIds,
        },
        isDeleted: false,
      },
    });

    return count === 0;
  },

  async bulkUpdate(
    updates: {
      id: string;
      uomId: string;
      currencyId: string;
      price: number;
      status: 'ACTIVE' | 'INACTIVE';
      key: string;
    }[],
  ) {
    if (!updates.length) {
      return { count: 0 };
    }

    const values = updates.map(
      (item) => Prisma.sql`(
      ${item.id}::uuid,
      ${item.uomId}::uuid,
      ${item.price}::double precision,
      ${item.currencyId}::uuid,
      ${item.status}::"StatusEnum",
      ${item.key}
    )`,
    );

    return prisma.$executeRaw`
  UPDATE "VendorProductPricing" vpp
  SET
    "uomId" = data."uomId"::uuid,
    "price" = data."price"::double precision,
    "currencyId" = data."currencyId"::uuid,
    "status" = data."status"::"StatusEnum",
    "key" = data."key",
    "updatedAt" = NOW()
  FROM (
    VALUES ${Prisma.join(values)}
  ) AS data(
    "id",
    "uomId",
    "price",
    "currencyId",
    "status",
    "key"
  )
  WHERE vpp."id" = data."id"::uuid
`;
  },

  findFirst(args: any, tx?: any) {
    const client = tx || prisma;
    return client.vendorProductPricing.findFirst(args);
  },
};
