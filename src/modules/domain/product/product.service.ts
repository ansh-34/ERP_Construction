import { Messages } from '../../../constants/index.js';
import { ProductRepository } from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

export const ProductService = {
  async createProduct(
    domainId: string,
    data: {
      displayName: any;
      code: string;
      productType: string;
      status: string;
    },
  ) {
    return ProductRepository.create({
      ...data,
      domainId,
    });
  },

  async listProducts(domainId: string, query: PaginationQuery) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, products] = await ProductRepository.listByDomain(
      domainId,
      limit,
      offset,
    );

    return {
      products,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async getProductById(domainId: string, id: string) {
    const product = await ProductRepository.findByIdAndDomain(id, domainId);
    if (!product) {
      throw new Error(Messages.PRODUCT.NOT_FOUND);
    }
    return product;
  },

  async deleteProduct(domainId: string, id: string) {
    const product = await ProductRepository.findByIdAndDomain(id, domainId);
    if (!product) {
      throw new Error(Messages.PRODUCT.NOT_FOUND);
    }
    return ProductRepository.softDelete(id);
  },
};
