import { Messages } from '../../../constants/index.js';
import {
  ProductRepository,
  productUomRepository,
} from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { normalizeStatus } from '../../../utils/validation.js';
import { transaction } from '../../../infra/database/prisma/transaction.js';

export const ProductService = {
  localizeName(value: any, langCode: string) {
    if (!value || typeof value !== 'object') return '';
    return value[langCode] || value.en || '';
  },

  normalizeCode(value: string) {
    return value.toString().trim().toUpperCase().replace(/\s+/g, '_');
  },

  async getStats(domainId: string) {
    const {
      totalProducts,
      activeCount,
      inactiveCount,
      rawMaterialCount,
      finishedProductCount,
    } = await ProductRepository.getStatsDetailed(domainId);

    return {
      totalProducts,
      activeCount,
      inactiveCount,
      rawMaterialCount,
      finishedProductCount,
    };
  },

  async createProduct(domainId: string, data: any) {
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

    const { grades, uoms, uom, ...productFields } = data;
    delete productFields.domainId;
    delete productFields.adminId;

    if (productFields.status) {
      productFields.status = normalizeStatus(productFields.status);
    }

    const mergedUoms = uom || uoms;

    return transaction(async (tx: any) => {
      // 1. Create the product
      const product = await ProductRepository.create(
        {
          ...productFields,
          code,
          searchText,
          domainId,
        },
        tx,
      );

      // 1.5 Create Uoms
      if (mergedUoms && mergedUoms.length > 0) {
        const normalizedUoms = mergedUoms.map((item: any) => {
          if (typeof item === 'string') return { id: item };
          return item;
        });
        for (const u of normalizedUoms) {
          await productUomRepository.create(
            {
              productId: product.id,
              uomId: u.id,
              domainId,
            },
            tx,
          );
        }
      }

      // 2. Create grades if provided
      const gradeMap = new Map<string, string>(); // gradeCode -> gradeId
      if (grades && grades.length > 0) {
        for (const g of grades) {
          const gCode =
            g.gradeCode ||
            g.gradeDisplayName?.en
              ?.toString()
              .toUpperCase()
              .replace(/\s+/g, '_');
          const gSearchText = Object.values(g.gradeDisplayName || {})
            .join(' ')
            .toLowerCase();

          const created = await tx.productGrades.create({
            data: {
              productId: product.id,
              gradeDisplayName: g.gradeDisplayName,
              gradeCode: gCode,
              searchText: gSearchText,
              status: normalizeStatus(g.status),
              domainId,
              isDeleted: false,
            },
          });
          gradeMap.set(gCode, created.id);
        }
      }

      // 3. Return fully populated product
      return ProductRepository.findFirst(
        {
          where: { id: product.id },
          include: {
            productGrades: {
              where: { isDeleted: false },
            },
            productUoms: {
              where: { isDeleted: false },
              include: { uom: true },
            },
          },
        },
        tx,
      );
    });
  },

  async listProducts(
    domainId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      [key: string]: any;
    },
    langCode: string,
  ) {
    const { offset, limit } = normalizePagination(query);
    const searchKey = query.searchKey?.trim() || '';

    const where = {
      domainId,
      isDeleted: false,
      ...(query.status && { status: query.status }),
      ...(searchKey && {
        searchText: {
          contains: searchKey,
          mode: 'insensitive',
        },
      }),
    };

    const [totalCount, products] = await Promise.all([
      ProductRepository.count({ where: where as any }),
      ProductRepository.findMany({
        where: where as any,
        include: {
          _count: {
            select: {
              productGrades: { where: { isDeleted: false } },
              productUoms: { where: { isDeleted: false } },
            },
          },
          productGrades: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
            },
          },
          productUoms: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' },
            select: {
              uomId: true,
            },
          },
          inventories: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              quantity: true,
              reorderLevel: true,
              status: true,
              createdAt: true,
              productId: true,
              productGradeId: true,
              uomId: true,
              productGrade: {
                select: { id: true, gradeDisplayName: true, gradeCode: true },
              },
              uom: {
                select: { id: true, displayName: true, code: true },
              },
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const localizedProducts = products.map((product: any) => {
      const { _count, inventories, productGrades, productUoms, ...rest } =
        product;
      return {
        ...rest,
        displayName: ProductService.localizeName(product.displayName, langCode),
        gradesCount: _count?.productGrades || 0,
        uomsCount: _count?.productUoms || 0,
        gradeIds: (productGrades || []).map((grade: any) => grade.id),
        uomIds: (productUoms || []).map((productUom: any) => productUom.uomId),
        inventories: (inventories || []).map((inv: any) => ({
          ...inv,
          productId: inv.productId,
          productGradeId: inv.productGradeId,
          uomId: inv.uomId,
          productGrade: inv.productGrade
            ? {
                ...inv.productGrade,
                gradeDisplayName: ProductService.localizeName(
                  inv.productGrade.gradeDisplayName,
                  langCode,
                ),
              }
            : inv.productGrade,
          uom: inv.uom
            ? {
                ...inv.uom,
                displayName: ProductService.localizeName(
                  inv.uom.displayName,
                  langCode,
                ),
              }
            : inv.uom,
        })),
      };
    });

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
        productGradeLastPurchaseRates: (
          grade.productGradeLastPurchaseRates || []
        ).map((rate: any) => ({
          ...rate,
          uomCode: rate.uom?.code ?? null,
          uomName: ProductService.localizeName(rate.uom?.displayName, language),
        })),
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

    const { grades, uoms, uom, ...productFields } = data;
    delete productFields.domainId;
    delete productFields.adminId;

    if (productFields.status) {
      productFields.status = normalizeStatus(productFields.status);
    }

    await ProductRepository.update(id, {
      ...productFields,
      ...(code ? { code } : {}),
      ...(searchText ? { searchText } : {}),
    });

    const mergedUoms = uom || uoms;
    // Handle uoms if provided
    if (mergedUoms) {
      await ProductService.bulkUpdateUoms(domainId, id, mergedUoms);
    }

    // Handle grades if provided
    if (grades && grades.length > 0) {
      await ProductService.bulkUpdateGrades(domainId, id, grades);
    }

    // Return fully populated product
    return ProductRepository.findByIdWithDetails(id, domainId);
  },

  // Standalone bulk update: grades

  async bulkUpdateGrades(domainId: string, productId: string, grades: any[]) {
    const product = await ProductRepository.findByIdAndDomain(
      productId,
      domainId,
    );
    if (!product) throw new Error(Messages.PRODUCT.NOT_FOUND);

    await transaction(async (tx: any) => {
      for (const grade of grades) {
        const gCode =
          grade.gradeCode ||
          grade.gradeDisplayName?.en
            ?.toString()
            .toUpperCase()
            .replace(/\s+/g, '_');
        const searchText = Object.values(grade.gradeDisplayName || {})
          .join(' ')
          .toLowerCase();

        if (grade.id) {
          // Update existing
          await tx.productGrades.update({
            where: { id: grade.id },
            data: {
              gradeDisplayName: grade.gradeDisplayName,
              gradeCode: gCode,
              searchText,
              status: grade.status ? normalizeStatus(grade.status) : undefined,
            },
          });
        } else {
          // Create new
          await tx.productGrades.create({
            data: {
              productId,
              domainId,
              gradeDisplayName: grade.gradeDisplayName,
              gradeCode: gCode,
              searchText,
              status: normalizeStatus(grade.status),
              isDeleted: false,
            },
          });
        }
      }
    });
  },

  // Standalone bulk update: uoms

  async bulkUpdateUoms(domainId: string, productId: string, uoms: any[]) {
    await transaction(async (tx: any) => {
      // Get existing uoms
      const existing = await productUomRepository.findMany(
        { productId, domainId },
        tx,
      );

      // Add new
      const existingUomIds = existing.map((e: any) => e.uomId);
      const normalizedUoms = (uoms || []).map((item: any) => {
        if (typeof item === 'string') return { id: item };
        return item;
      });
      const toAdd = normalizedUoms.filter(
        (u: any) => !existingUomIds.includes(u.id),
      );
      for (const u of toAdd) {
        await productUomRepository.create(
          {
            productId,
            uomId: u.id,
            domainId,
          },
          tx,
        );
      }
    });
  },
};
