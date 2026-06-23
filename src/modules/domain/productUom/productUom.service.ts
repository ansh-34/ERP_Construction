import { Messages } from '../../../constants/index.js';
import { Prisma } from '@infra/database/prisma/generated/prisma/client/client';
import {
  productUomRepository,
  ProductRepository,
  uomRepository,
} from '../../../repositories/index.js';
import { transaction } from '../../../infra/database/prisma/transaction.js';
import { normalizeStatus } from '../../../utils/validation.js';

export const ProductUomService = {
  localizeName(value: any, langCode: string) {
    if (!value || typeof value !== 'object') return '';
    return value[langCode] || value.en || '';
  },

  async create(
    domainId: string,
    productId: string,
    dto: { uomId: string; status?: 'ACTIVE' | 'INACTIVE'; [key: string]: any },
  ) {
    return transaction(async (tx: any) => {
      const product = await ProductRepository.findFirst(
        { where: { id: productId, domainId, isDeleted: false } },
        tx,
      );
      if (!product) throw new Error(Messages.PRODUCT.NOT_FOUND);

      const uom = await uomRepository.findFirst(
        { where: { id: dto.uomId, domainId, isDeleted: false } },
        tx,
      );
      if (!uom) throw new Error(Messages.UOM.NOT_FOUND);

      const existing = await productUomRepository.findByProductAndUom(
        productId,
        dto.uomId,
        tx,
      );
      if (existing && !existing.isDeleted)
        throw new Error(Messages.PRODUCT_UOM.ALEADY_ASSIGNED);

      if (existing?.isDeleted) {
        return productUomRepository.restoreWithUom(
          existing.id,
          normalizeStatus(dto.status),
          tx,
        );
      }

      const status = normalizeStatus(dto.status);
      try {
        return await productUomRepository.createWithUom(
          { productId, uomId: dto.uomId, domainId, status },
          tx,
        );
      } catch (error: any) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          const conflicted = await productUomRepository.findByProductAndUom(
            productId,
            dto.uomId,
            tx,
          );

          if (conflicted && !conflicted.isDeleted) {
            throw new Error(Messages.PRODUCT_UOM.ALEADY_ASSIGNED);
          }

          if (conflicted?.isDeleted) {
            return productUomRepository.restoreWithUom(
              conflicted.id,
              status,
              tx,
            );
          }
        }

        throw error;
      }
    });
  },

  async findAll(
    domainId: string,
    productId: string,
    query: {
      page?: number | string;
      limit?: number | string;
      status?: 'ACTIVE' | 'INACTIVE';
      [key: string]: any;
    },
    langCode: string,
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where = {
      domainId,
      productId,
      isDeleted: false,
      ...(query.status && { status: query.status }),
    };
    const [data, total] = await productUomRepository.listWithDetails(
      where,
      skip,
      limit,
    );

    const normalizedData = data.map((productUom: any) => {
      const { uom, product, ...junction } = productUom;
      return {
        ...uom,
        displayName: ProductUomService.localizeName(uom.displayName, langCode),
        productId: junction.productId,
        product: product
          ? {
              ...product,
              displayName: ProductUomService.localizeName(
                product.displayName,
                langCode,
              ),
            }
          : product,
      };
    });

    return {
      data: normalizedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findAllDomainProductUoms(
    domainId: string,
    query: {
      page?: number | string;
      limit?: number | string;
      status?: 'ACTIVE' | 'INACTIVE';
      [key: string]: any;
    },
    langCode: string,
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where = {
      domainId,
      isDeleted: false,
      ...(query.status && { status: query.status }),
    };

    const [data, total] = await productUomRepository.listWithDetails(
      where,
      skip,
      limit,
    );

    const normalizedData = data.map((productUom: any) => {
      const { uom, product, ...junction } = productUom;
      return {
        ...uom,
        displayName: ProductUomService.localizeName(uom.displayName, langCode),
        productId: junction.productId,
        product: product
          ? {
              ...product,
              displayName: ProductUomService.localizeName(
                product.displayName,
                langCode,
              ),
            }
          : product,
      };
    });

    return {
      data: normalizedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findOne(
    domainId: string,
    productId: string,
    id: string,
    language: string | null = null,
  ) {
    const record: any = await productUomRepository.findByIdAndProductAndDomain(
      id,
      productId,
      domainId,
    );
    if (!record) throw new Error(Messages.PRODUCT_UOM.NOT_FOUND);

    if (language) {
      record.uom.displayName = ProductUomService.localizeName(
        record.uom.displayName,
        language,
      );
    }

    return record;
  },

  async softDelete(domainId: string, productId: string, id: string) {
    await this.findOne(domainId, productId, id);
    return productUomRepository.softDelete(id);
  },
};
