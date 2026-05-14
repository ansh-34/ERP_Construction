import { Messages } from '../../../constants/index.js';
import { ProductRepository } from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { ProductTypeEnum } from '../../../infra/database/prisma/generated/prisma/client/enums.js';

export const ProductService = {
  localizeName(value: any, langCode: string) {
    if (!value || typeof value !== 'object') return '';
    return value[langCode] || value.en || '';
  },

  normalizeCode(value: string) {
    return value.toString().trim().toUpperCase().replace(/\s+/g, '_');
  },

  async createProduct(
    domainId: string,
    data: {
      displayName: Record<string, string>;
      productType: ProductTypeEnum;
      status: string;
    },
  ) {
    const incomingLanguageCodes: string[] = Object.keys(data.displayName || {});
    if (!incomingLanguageCodes.includes('en')) {
      throw new Error(Messages.PRODUCT.DISPLAY_NAME_EN_REQUIRED);
    }

    const searchText = Object.values(data.displayName).join(' ').toLowerCase();
    const code = data?.displayName?.en
      ?.toString()
      .toUpperCase()
      .replace(/\s+/g, '_');

    const existing = await ProductRepository.findActiveByCode(domainId, code);
    if (existing) {
      throw new Error(Messages.PRODUCT.CODE_ALREADY_EXISTS);
    }

    return ProductRepository.create({
      ...data,
      code,
      searchText,
      domainId,
    });
  },

  async listProducts(
    domainId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: string;
      searchKey?: string;
      [key: string]: any;
    },
    langCode: string,
  ) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, products] = await ProductRepository.listByDomain(
      domainId,
      limit,
      offset,
      {
        status: (query as any)?.status,
        searchKey: (query as any)?.searchKey,
      },
    );

    const localizedProducts = products.map((product: any) => ({
      ...product,
      displayName: ProductService.localizeName(product.displayName, langCode),
      productGrades: (product.productGrades || []).map((grade: any) => ({
        ...grade,
        gradeDisplayName: ProductService.localizeName(
          grade.gradeDisplayName,
          langCode,
        ),
        productGradeStdRates: (grade.productGradeStdRates || []).map(
          (stdRate: any) => ({
            ...stdRate,
            stdRateType: ProductService.localizeName(
              stdRate.stdRateType,
              langCode,
            ),
            productGrade: stdRate.productGrade
              ? {
                  ...stdRate.productGrade,
                  gradeDisplayName: ProductService.localizeName(
                    stdRate.productGrade.gradeDisplayName,
                    langCode,
                  ),
                }
              : stdRate.productGrade,
          }),
        ),
        // inventories: (grade.inventories || []).map((inv: any) => ({
        //   ...inv,
        //   uom: inv.uom
        //     ? {
        //         ...inv.uom,
        //         displayName: ProductService.localizeName(
        //           inv.uom.displayName,
        //           langCode,
        //         ),
        //       }
        //     : inv.uom,
        // })),
      })),
      productUoms: (product.productUoms || []).map((productUom: any) => ({
        ...productUom,
        uom: {
          ...productUom.uom,
          displayName: ProductService.localizeName(
            productUom.uom.displayName,
            langCode,
          ),
        },
      })),
      inventories: (product.inventories || []).map((inventory: any) => ({
        ...inventory,
        productGrade: inventory.productGrade
          ? {
              ...inventory.productGrade,
              gradeDisplayName: ProductService.localizeName(
                inventory.productGrade.gradeDisplayName,
                langCode,
              ),
            }
          : inventory.productGrade,
        uom: {
          ...inventory.uom,
          displayName: ProductService.localizeName(
            inventory.uom.displayName,
            langCode,
          ),
        },
      })),
    }));

    return {
      products: localizedProducts,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  async getProductById(
    domainId: string,
    id: string,
    language: string | null = null,
  ) {
    const product: any = await ProductRepository.findByIdWithDetails(
      id,
      domainId,
    );
    if (!product) {
      throw new Error(Messages.PRODUCT.NOT_FOUND);
    }

    if (language) {
      product.displayName = ProductService.localizeName(
        product.displayName,
        language,
      );

      product.productGrades = product.productGrades.map((grade: any) => ({
        ...grade,
        gradeDisplayName: ProductService.localizeName(
          grade.gradeDisplayName,
          language,
        ),
        productGradeStdRates: (grade.productGradeStdRates || []).map(
          (stdRate: any) => ({
            ...stdRate,
            stdRateType: ProductService.localizeName(
              stdRate.stdRateType,
              language,
            ),
            productGrade: stdRate.productGrade
              ? {
                  ...stdRate.productGrade,
                  gradeDisplayName: ProductService.localizeName(
                    stdRate.productGrade.gradeDisplayName,
                    language,
                  ),
                }
              : stdRate.productGrade,
          }),
        ),
        // inventories: (grade.inventories || []).map((inv: any) => ({
        //   ...inv,
        //   uom: inv.uom
        //     ? {
        //         ...inv.uom,
        //         displayName: ProductService.localizeName(
        //           inv.uom.displayName,
        //           language,
        //         ),
        //       }
        //     : inv.uom,
        // })),
      }));

      product.productUoms = product.productUoms.map((productUom: any) => ({
        ...productUom,
        uom: {
          ...productUom.uom,
          displayName: ProductService.localizeName(
            productUom.uom.displayName,
            language,
          ),
        },
      }));

      product.inventories = product.inventories.map((inventory: any) => ({
        ...inventory,
        productGrade: {
          ...inventory.productGrade,
          gradeDisplayName: ProductService.localizeName(
            inventory.productGrade.gradeDisplayName,
            language,
          ),
        },
        uom: {
          ...inventory.uom,
          displayName: ProductService.localizeName(
            inventory.uom.displayName,
            language,
          ),
        },
      }));
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

  async updateProduct(domainId: string, id: string, data: any) {
    const product = await ProductRepository.findByIdAndDomain(id, domainId);
    if (!product) {
      throw new Error(Messages.PRODUCT.NOT_FOUND);
    }

    if (data?.displayName) {
      const incomingLanguageCodes: string[] = Object.keys(data.displayName);
      if (!incomingLanguageCodes.includes('en')) {
        throw new Error(Messages.PRODUCT.DISPLAY_NAME_EN_REQUIRED);
      }
    }

    const searchText = data?.displayName
      ? Object.values(data.displayName).join(' ').toLowerCase()
      : null;

    let code: string | null = null;
    if (data?.code) {
      code = ProductService.normalizeCode(data.code);
      if (code !== product.code) {
        const duplicate = await ProductRepository.findDuplicateCode(
          domainId,
          code,
          id,
        );
        if (duplicate) {
          throw new Error(Messages.PRODUCT.CODE_ALREADY_EXISTS);
        }
      }
    }

    return ProductRepository.update(id, {
      ...data,
      ...(code ? { code } : {}),
      ...(searchText ? { searchText } : {}),
    });
  },
};
