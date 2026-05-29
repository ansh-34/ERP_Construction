import { Messages } from '../../../constants/index.js';
import { ProductRepository } from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';
import { normalizeStatus } from '../../../utils/validation.js';

import prisma from '../../../infra/database/prisma/prisma.client.js';

export const ProductService = {
  localizeName(value: any, langCode: string) {
    if (!value || typeof value !== 'object') return '';
    return value[langCode] || value.en || '';
  },

  normalizeCode(value: string) {
    return value.toString().trim().toUpperCase().replace(/\s+/g, '_');
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

    const { grades, standardRates, uoms, uom, ...productFields } = data;
    delete productFields.domainId;
    delete productFields.adminId;

    if (productFields.status) {
      productFields.status = normalizeStatus(productFields.status);
    }

    const mergedUoms = uom || uoms;

    return prisma.$transaction(async (tx: any) => {
      // 1. Create the product
      const product = await tx.product.create({
        data: {
          ...productFields,
          code,
          searchText,
          domainId,
        },
      });

      // 1.5 Create Uoms
      if (mergedUoms && mergedUoms.length > 0) {
        const normalizedUoms = mergedUoms.map((item: any) => {
          if (typeof item === 'string') return { id: item };
          return item;
        });
        for (const u of normalizedUoms) {
          await tx.productUom.create({
            data: {
              productId: product.id,
              uomId: u.id,
              domainId,
            },
          });
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

          // Create standard rates nested inside the grade
          if (g.standardRates && g.standardRates.length > 0) {
            for (const sr of g.standardRates) {
              const srSearchText = Object.values(sr.stdRateType || {})
                .join(' ')
                .toLowerCase();
              await tx.productGradeStdRates.create({
                data: {
                  productId: product.id,
                  productGradeId: created.id,
                  stdRateType: sr.stdRateType,
                  stdRateValue: sr.stdRateValue,
                  alertThresold: sr.alertThresold,
                  searchText: srSearchText,
                  status: normalizeStatus(sr.status),
                  domainId,
                  isDeleted: false,
                },
              });
            }
          }
        }
      }

      // 3. Create standard rates if provided
      if (standardRates && standardRates.length > 0) {
        for (let i = 0; i < standardRates.length; i++) {
          const sr = standardRates[i];
          let gradeId = sr.gradeId;

          if (!gradeId && sr.gradeCode) {
            gradeId = gradeMap.get(sr.gradeCode);
          } else if (!gradeId && !sr.gradeCode && grades && grades[i]) {
            const gCode =
              grades[i].gradeCode ||
              grades[i].gradeDisplayName?.en
                ?.toString()
                .toUpperCase()
                .replace(/\s+/g, '_');
            gradeId = gradeMap.get(gCode);
          }

          if (!gradeId) continue; // skip if no grade match

          const srSearchText = Object.values(sr.stdRateType || {})
            .join(' ')
            .toLowerCase();
          await tx.productGradeStdRates.create({
            data: {
              productId: product.id,
              productGradeId: gradeId,
              stdRateType: sr.stdRateType,
              stdRateValue: sr.stdRateValue,
              alertThresold: sr.alertThresold,
              searchText: srSearchText,
              status: normalizeStatus(sr.status),
              domainId,
              isDeleted: false,
            },
          });
        }
      }

      // 4. Return fully populated product
      return tx.product.findFirst({
        where: { id: product.id },
        include: {
          productGrades: {
            where: { isDeleted: false },
            include: {
              productGradeStdRates: { where: { isDeleted: false } },
            },
          },
          productUoms: {
            where: { isDeleted: false },
            include: { uom: true },
          },
        },
      });
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
    langCode?: string,
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

    const [totalCount, products] = await prisma.$transaction([
      prisma.product.count({ where: where as any }),
      prisma.product.findMany({
        where: where as any,
        include: {
          _count: {
            select: {
              productGrades: { where: { isDeleted: false } },
              productUoms: { where: { isDeleted: false } },
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
      const { _count, inventories, ...rest } = product;
      return {
        ...rest,
        displayName: langCode
          ? ProductService.localizeName(product.displayName, langCode)
          : product.displayName,
        gradesCount: _count?.productGrades || 0,
        uomsCount: _count?.productUoms || 0,
        inventories: (inventories || []).map((inv: any) => ({
          ...inv,
          productId: inv.productId,
          productGradeId: inv.productGradeId,
          uomId: inv.uomId,
          productGrade: inv.productGrade
            ? {
                ...inv.productGrade,
                gradeDisplayName: langCode
                  ? ProductService.localizeName(
                      inv.productGrade.gradeDisplayName,
                      langCode,
                    )
                  : inv.productGrade.gradeDisplayName,
              }
            : inv.productGrade,
          uom: inv.uom
            ? {
                ...inv.uom,
                displayName: langCode
                  ? ProductService.localizeName(inv.uom.displayName, langCode)
                  : inv.uom.displayName,
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

    const { grades, standardRates, uoms, uom, ...productFields } = data;
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

    // Handle standardRates if provided
    if (standardRates && standardRates.length > 0) {
      if (grades && grades.length > 0) {
        for (let i = 0; i < standardRates.length; i++) {
          if (
            !standardRates[i].gradeId &&
            !standardRates[i].gradeCode &&
            grades[i]
          ) {
            standardRates[i].gradeCode =
              grades[i].gradeCode ||
              grades[i].gradeDisplayName?.en
                ?.toString()
                .toUpperCase()
                .replace(/\s+/g, '_');
          }
        }
      }
      await ProductService.bulkUpdateStandardRates(domainId, id, standardRates);
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

    await prisma.$transaction(async (tx: any) => {
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

        let gradeId = grade.id;
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
          const created = await tx.productGrades.create({
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
          gradeId = created.id;
        }

        // Handle nested standardRates
        if (grade.standardRates) {
          for (const sr of grade.standardRates) {
            const srSearchText = Object.values(sr.stdRateType || {})
              .join(' ')
              .toLowerCase();

            if (sr.id) {
              await tx.productGradeStdRates.update({
                where: { id: sr.id },
                data: {
                  productGradeId: gradeId,
                  stdRateType: sr.stdRateType,
                  stdRateValue: sr.stdRateValue,
                  alertThresold: sr.alertThresold,
                  searchText: srSearchText,
                  status: sr.status ? normalizeStatus(sr.status) : undefined,
                },
              });
            } else {
              await tx.productGradeStdRates.create({
                data: {
                  productId,
                  productGradeId: gradeId,
                  domainId,
                  stdRateType: sr.stdRateType,
                  stdRateValue: sr.stdRateValue,
                  alertThresold: sr.alertThresold,
                  searchText: srSearchText,
                  status: normalizeStatus(sr.status),
                  isDeleted: false,
                },
              });
            }
          }
        }
      }
    });
  },

  // Standalone bulk update: uoms

  async bulkUpdateUoms(domainId: string, productId: string, uoms: any[]) {
    await prisma.$transaction(async (tx: any) => {
      // Get existing uoms
      const existing = await tx.productUom.findMany({
        where: { productId, domainId },
      });

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
        await tx.productUom.create({
          data: {
            productId,
            uomId: u.id,
            domainId,
          },
        });
      }
    });
  },

  // Standalone bulk update: standard rates

  async bulkUpdateStandardRates(
    domainId: string,
    productId: string,
    standardRates: any[],
  ) {
    const product = await ProductRepository.findByIdAndDomain(
      productId,
      domainId,
    );
    if (!product) throw new Error(Messages.PRODUCT.NOT_FOUND);

    // Fetch active grades to resolve gradeCode → gradeId
    const activeGrades = await prisma.productGrades.findMany({
      where: { productId, domainId, isDeleted: false },
    });

    await prisma.$transaction(async (tx: any) => {
      for (const sr of standardRates) {
        const searchText = Object.values(sr.stdRateType || {})
          .join(' ')
          .toLowerCase();

        // Resolve gradeId
        let gradeId = sr.gradeId;
        if (!gradeId && sr.gradeCode) {
          const match = activeGrades.find(
            (g: any) => g.gradeCode === sr.gradeCode,
          );
          if (match) gradeId = match.id;
        }
        if (!gradeId) continue; // skip if we can't match a grade

        if (sr.id) {
          // Update existing
          await tx.productGradeStdRates.update({
            where: { id: sr.id },
            data: {
              productGradeId: gradeId,
              stdRateType: sr.stdRateType,
              stdRateValue: sr.stdRateValue,
              alertThresold: sr.alertThresold,
              searchText,
              status: sr.status ? normalizeStatus(sr.status) : undefined,
            },
          });
        } else {
          // Create new
          await tx.productGradeStdRates.create({
            data: {
              productId,
              productGradeId: gradeId,
              domainId,
              stdRateType: sr.stdRateType,
              stdRateValue: sr.stdRateValue,
              alertThresold: sr.alertThresold,
              searchText,
              status: normalizeStatus(sr.status),
              isDeleted: false,
            },
          });
        }
      }
    });
  },

  // Standalone bulk delete methods

  async bulkDeleteGrades(domainId: string, productId: string, ids: string[]) {
    await prisma.$transaction([
      prisma.productGradeStdRates.updateMany({
        where: { productGradeId: { in: ids }, productId, domainId },
        data: { isDeleted: true },
      }),
      prisma.productGrades.updateMany({
        where: { id: { in: ids }, productId, domainId },
        data: { isDeleted: true },
      }),
    ]);
  },

  async bulkDeleteStandardRates(
    domainId: string,
    productId: string,
    ids: string[],
  ) {
    await prisma.productGradeStdRates.updateMany({
      where: { id: { in: ids }, productId, domainId },
      data: { isDeleted: true },
    });
  },

  async bulkDeleteUoms(domainId: string, productId: string, ids: string[]) {
    // For productUoms, we update them to be softly deleted
    // But they use `productUom` table and `uomId` or `id`.
    // Wait, the payload gives UUIDs. These are `productUom.id` or `productUom.uomId`?
    // In linking we used `uom.id` as `uomId`. If we use `uom.id` for deletion, we should match `uomId`.
    // The previous endpoints and UOM schema take `{ id: uomId }`.
    // So the incoming `ids` are actually `uomId`s.
    await prisma.productUom.updateMany({
      where: { uomId: { in: ids }, productId, domainId },
      data: { isDeleted: true },
    });
  },
};
