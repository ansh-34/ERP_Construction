import fs from 'fs';
import XLSX from 'xlsx';
import { Messages } from '../../../constants/index.js';
import {
  AdminCurrencyRepository,
  ProductGradeRepository,
  ProductRepository,
  uomRepository,
  vendorProductPriceRepository,
  vendorRepository,
} from '../../../repositories/index.js';
import { normalizePagination } from '@/utils/pagination.js';

export const VendorProductPriceService = {
  async create(
    domainId: string,
    adminId: string,
    vendorId: string,
    dto: {
      productId: string;
      productGradeId: string;
      currencyId: string;
      uomId: string;
      price: number;
    }[],
  ) {
    const allKeys = dto.map(
      (item) =>
        `${vendorId}-${item.productId}-${item.productGradeId}-${item.uomId}-${item.currencyId}-${domainId}`,
    );

    if (new Set(allKeys).size !== allKeys.length) {
      throw new Error(
        Messages.VENDOR_PRODUCT_PRICE.DUPLICATE_ENTRIES_IN_REQUEST,
      );
    }

    const [
      vendor,
      validateProducts,
      validateGrades,
      validateUoms,
      validateCurrencies,
    ] = await Promise.all([
      vendorRepository.findByIdAndDomain(vendorId, domainId),
      ProductRepository.validateProductIds(
        domainId,
        dto.map((p) => p.productId),
      ),
      ProductGradeRepository.validateProductGradeIds(
        domainId,
        dto.map((p) => p.productGradeId),
      ),
      uomRepository.validateUomIds(
        domainId,
        dto.map((p) => p.uomId),
      ),
      AdminCurrencyRepository.validateCurrencyIds(
        adminId,
        dto.map((p) => p.currencyId),
      ),
    ]);

    if (!vendor) {
      throw new Error(Messages.VENDOR.NOT_FOUND);
    }
    if (!validateProducts) {
      throw new Error(Messages.PRODUCT.INVALID_PRODUCT_SELECTED);
    }
    if (!validateGrades) {
      throw new Error(Messages.PRODUCT_GRADE.INVALID_PRODUCT_GRADE_SELECTED);
    }
    if (!validateUoms) {
      throw new Error(Messages.UOM.INVALID_UOM_SELECTED);
    }
    if (!validateCurrencies) {
      throw new Error(Messages.CURRENCY.INVALID_CURRENCY_SELECTED);
    }

    const recordsToCreate = dto.map((item) => ({
      vendorId,
      productId: item.productId,
      productGradeId: item.productGradeId,
      uomId: item.uomId,
      price: item.price,
      currencyId: item.currencyId,
      searchText: vendor.name.toLowerCase(),
      key: `${vendorId}-${item.productId}-${item.productGradeId}-${item.uomId}-${item.currencyId}-${domainId}`,
      status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    }));

    return vendorProductPriceRepository.bulkUpsert(
      domainId,
      adminId,
      recordsToCreate,
    );
  },

  async findAll(
    domainId: string,
    query: {
      offset?: string;
      limit?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      productCode?: string;
      vendorId?: string;
    },
    langCode: string,
  ) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, data] = await vendorProductPriceRepository.listByDomain(
      domainId,
      limit,
      offset,
      {
        filters: {
          status: query.status,
          searchKey: query.searchKey,
          productCode: query.productCode,
          vendorId: query.vendorId,
        },
        select: {
          id: true,
          vendorId: true,
          productId: true,
          currencyId: true,
          productGradeId: true,
          uomId: true,
          price: true,
          status: true,
          product: { select: { displayName: true, code: true } },
          productGrade: { select: { gradeDisplayName: true, gradeCode: true } },
          uom: { select: { symbol: true, displayName: true, code: true } },
          createdAt: true,
          updatedAt: true,
          vendor: { select: { name: true, email: true, contactPerson: true } },
          currency: { select: { name: true, code: true, symbol: true } },
        },
      },
    );

    const normalizeData = data.map((item: any) => ({
      ...item,
      product: {
        ...item.product,
        displayName:
          item.product.displayName[langCode] || item.product.displayName.en,
      },
      productGrade: {
        ...item.productGrade,
        gradeDisplayName:
          item.productGrade.gradeDisplayName[langCode] ??
          item.productGrade.gradeDisplayName.en,
      },
      uom: {
        ...item.uom,
        displayName: item.uom.displayName[langCode] ?? item.uom.displayName.en,
      },
      currency: {
        ...item.currency,
        name: item.currency.name[langCode] ?? item.currency.name.en,
      },
    }));

    return {
      vendorProductPrices: normalizeData,
      pagination: {
        totalCount,
        currentCount: data.length,
        offset,
        limit,
      },
    };
  },

  async findOne(domainId: string, id: string, langCode: string | null) {
    const record: any = await vendorProductPriceRepository.findByIdAndDomain(
      id,
      domainId,
      {
        select: {
          id: true,
          vendorId: true,
          productId: true,
          currencyId: true,
          productGradeId: true,
          uomId: true,
          price: true,
          status: true,
          product: { select: { displayName: true, code: true } },
          productGrade: { select: { gradeDisplayName: true, gradeCode: true } },
          uom: { select: { symbol: true, displayName: true, code: true } },
          createdAt: true,
          updatedAt: true,
          vendor: { select: { name: true, email: true, contactPerson: true } },
          currency: { select: { name: true, code: true, symbol: true } },
        },
      },
    );
    if (!record) throw new Error(Messages.VENDOR_PRODUCT_PRICE.NOT_FOUND);

    if (!langCode) return record;

    record.product = {
      ...record.product,
      displayName:
        record.product.displayName[langCode] || record.product.displayName.en,
    };
    record.productGrade = {
      ...record.productGrade,
      gradeDisplayName:
        record.productGrade.gradeDisplayName[langCode] ??
        record.productGrade.gradeDisplayName.en,
    };
    record.uom = {
      ...record.uom,
      displayName:
        record.uom.displayName[langCode] ?? record.uom.displayName.en,
    };
    record.currency = {
      ...record.currency,
      name: record.currency.name[langCode] ?? record.currency.name.en,
    };
    return record;
  },

  async update(
    domainId: string,
    dto: {
      vendorProductPriceId: string;
      uomId?: string;
      price?: number;
      status?: 'ACTIVE' | 'INACTIVE';
    }[],
  ) {
    const ids = dto.map((d) => d.vendorProductPriceId);
    const uomIdsToValidate = dto
      .filter((d) => d.uomId)
      .map((d) => d.uomId!) as string[];

    if (uomIdsToValidate.length > 0) {
      const validateUoms = await uomRepository.validateUomIds(
        domainId,
        uomIdsToValidate,
      );
      if (!validateUoms) {
        throw new Error(Messages.UOM.INVALID_UOM_SELECTED);
      }
    }

    const [recordsCount, records]: any =
      await vendorProductPriceRepository.findAllByDomain(domainId, {
        filters: { ids },
      });
    if (recordsCount !== ids.length) {
      throw new Error(
        Messages.VENDOR_PRODUCT_PRICE.INVALID_VENDOR_PRODUCT_PRICE_SELECTED,
      );
    }

    const recordMap = new Map(
      records.map((record: any) => [record.id, record]),
    );

    const updatedRecords = dto.map((item: any) => {
      const existing: any = recordMap.get(item.vendorProductPriceId)!;

      const uomId = item.uomId ?? existing.uomId;
      const currencyId = item.currencyId ?? existing.currencyId;

      return {
        id: existing.id,
        uomId,
        price: item.price ?? existing.price,
        currencyId,
        status: item.status ?? existing.status,
        key: `${existing.vendorId}-${existing.productId}-${existing.productGradeId}-${uomId}-${currencyId}-${domainId}`,
      };
    });

    const keys = updatedRecords.map((r) => r.key);

    if (new Set(keys).size !== keys.length) {
      throw new Error(
        Messages.VENDOR_PRODUCT_PRICE.DUPLICATE_ENTRIES_IN_REQUEST,
      );
    }

    const uniqueKeysValid =
      await vendorProductPriceRepository.validateUniqueKeys(
        domainId,
        keys,
        updatedRecords.map((r) => r.id),
      );

    if (!uniqueKeysValid) {
      throw new Error(Messages.VENDOR_PRODUCT_PRICE.UNIQUE_KEYS_VIOLATION);
    }

    return vendorProductPriceRepository.bulkUpdate(updatedRecords);
  },

  async softDelete(domainId: string, id: string) {
    const existing = await vendorProductPriceRepository.findByIdAndDomain(
      id,
      domainId,
    );
    if (!existing) {
      throw new Error(Messages.VENDOR_PRODUCT_PRICE.NOT_FOUND);
    }
    return vendorProductPriceRepository.softDelete(id);
  },

  async importExcel(filePath: string, domainId: string, adminId: string) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet) as any[];

      const productCodes = [
        ...new Set(data.map((r) => r.productCode).filter(Boolean)),
      ];
      const gradeCodes = [
        ...new Set(data.map((r) => r.productGradeCode).filter(Boolean)),
      ];
      const uomCodes = [...new Set(data.map((r) => r.uomCode).filter(Boolean))];
      const currencyCodes = [
        ...new Set(data.map((r) => r.currencyCode).filter(Boolean)),
      ];
      const vendorNames = [
        ...new Set(data.map((r) => r.vendorName).filter(Boolean)),
      ];

      const [
        validateProducts,
        validateGrades,
        validateUoms,
        validateVendors,
        validateCurrencies,
      ] = await Promise.all([
        ProductRepository.validateProductCodes(domainId, productCodes),
        ProductGradeRepository.validateProductGradeCodes(domainId, gradeCodes),
        uomRepository.validateUomCodes(domainId, uomCodes),
        vendorRepository.validateVendorNames(domainId, vendorNames),
        AdminCurrencyRepository.validateCurrencyCodes(adminId, currencyCodes),
      ]);

      if (!validateProducts) {
        throw new Error(Messages.PRODUCT.INVALID_PRODUCT_SELECTED);
      }
      if (!validateGrades) {
        throw new Error(Messages.PRODUCT_GRADE.INVALID_PRODUCT_GRADE_SELECTED);
      }
      if (!validateUoms) {
        throw new Error(Messages.UOM.INVALID_UOM_SELECTED);
      }
      if (!validateVendors) {
        throw new Error(Messages.VENDOR.INVALID_VENDOR_SELECTED);
      }
      if (!validateCurrencies) {
        throw new Error(Messages.CURRENCY.INVALID_CURRENCY_SELECTED);
      }

      const [productMap, gradeMap, uomMap, vendorMap, currencyMap] =
        await Promise.all([
          ProductRepository.find(domainId, {
            filters: { codes: productCodes },
            select: { id: true, code: true },
          }).then((res) => new Map(res.map((r) => [r.code, r]))),
          ProductGradeRepository.find(domainId, {
            filters: { gradeCodes },
            select: { id: true, gradeCode: true, productId: true },
          }).then((res) => new Map(res.map((r) => [r.gradeCode, r]))),
          uomRepository
            .find(domainId, {
              filters: { codes: uomCodes },
              select: { id: true, code: true },
            })
            .then((res) => new Map(res.map((r) => [r.code, r]))),
          vendorRepository
            .find(domainId, {
              filters: { names: vendorNames },
              select: { id: true, name: true },
            })
            .then((res) => new Map(res.map((r) => [r.name, r]))),
          AdminCurrencyRepository.find({
            filters: { codes: currencyCodes, adminId, isEnabled: true },
            select: { currencyId: true, currency: { select: { code: true } } },
          }).then((res) => new Map(res.map((r: any) => [r.currency.code, r]))),
        ]);

      const finalData = [];
      const failedRows = [];

      for (const row of data) {
        const product = productMap.get(row.productCode);
        const grade = gradeMap.get(row.productGradeCode);
        const uom = uomMap.get(row.uomCode);
        const vendor = vendorMap.get(row.vendorName);
        const currency = currencyMap.get(row.currencyCode);

        if (!product) {
          failedRows.push({ ...row, error: 'Invalid productCode' });
          continue;
        }
        if (!grade) {
          failedRows.push({ ...row, error: 'Invalid productGradeCode' });
          continue;
        }
        if (!uom) {
          failedRows.push({ ...row, error: 'Invalid uomCode' });
          continue;
        }
        if (!vendor) {
          failedRows.push({ ...row, error: 'Invalid vendorName' });
          continue;
        }
        if (!currency) {
          failedRows.push({ ...row, error: 'Invalid currencyCode' });
          continue;
        }
        if (grade.productId !== product.id) {
          failedRows.push({ ...row, error: 'Grade mismatch for product' });
          continue;
        }

        finalData.push({
          vendorId: vendor.id,
          vendorName: row.vendorName,
          productId: product.id,
          productGradeId: grade.id,
          uomId: uom.id,
          price: parseFloat(row.price),
          currencyId: currency.currencyId,
          productCode: row.productCode,
          productGradeCode: row.productGradeCode,
          uomCode: row.uomCode,
          searchText: row.vendorName.toLowerCase(),
          domainId,
          adminId,
          status: 'ACTIVE' as any,
          isDeleted: false,
          key: `${vendor.id}-${product.id}-${grade.id}-${uom.id}-${currency.currencyId}-${domainId}`,
        });
      }

      if (finalData.length > 0) {
        const chunkSize = 1000;
        for (let i = 0; i < finalData.length; i += chunkSize) {
          await vendorProductPriceRepository.bulkUpsert(
            domainId,
            adminId,
            finalData.slice(i, i + chunkSize) as any,
          );
        }
      }

      fs.unlinkSync(filePath);

      return {
        inserted: finalData.length,
        failed: failedRows.length,
        failedRows,
      };
    } catch (error) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  },

  async exportExcel(domainId: string) {
    const data: any = await vendorProductPriceRepository.findAllByDomain(
      domainId,
      {
        select: {
          vendor: {
            select: { name: true },
          },
          product: {
            select: { code: true, displayName: true },
          },
          productGrade: {
            select: {
              gradeCode: true,
              gradeDisplayName: true,
            },
          },
          uom: {
            select: { code: true, displayName: true, symbol: true },
          },
          currency: {
            select: { code: true, name: true },
          },
          price: true,
        },
      },
    );

    const exportData = data?.[1]?.map((item: any) => ({
      vendorName: item.vendor.name,
      productCode: item.product.code,
      productName:
        typeof item.product.displayName === 'object' &&
        item.product.displayName !== null
          ? (item.product.displayName as any).en || ''
          : '',
      productGradeCode: item.productGrade.gradeCode,
      productGradeName:
        typeof item.productGrade.gradeDisplayName === 'object' &&
        item.productGrade.gradeDisplayName !== null
          ? (item.productGrade.gradeDisplayName as any).en || ''
          : '',
      uomCode: item.uom.code,
      uomName:
        typeof item.uom.displayName === 'object' &&
        item.uom.displayName !== null
          ? (item.uom.displayName as any).en || ''
          : '',
      price: item.price,
      currencyCode: item.currency.code,
      currencyName:
        typeof item.currency.name === 'object' && item.currency.name !== null
          ? (item.currency.name as any).en || ''
          : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'VendorPricing');

    if (!fs.existsSync('exports')) {
      fs.mkdirSync('exports', { recursive: true });
    }

    const filePath = `exports/vendor-${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, filePath);

    return filePath;
  },
};
