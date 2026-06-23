import fs from 'fs';
import XLSX from 'xlsx';
import { Messages } from '../../../constants/index.js';
import {
  AdminCurrencyRepository,
  AdminLanguageRepository,
  InventoryRepository,
  ProductRepository,
  ProductGradeRepository,
  uomRepository,
  RawMaterialPurchaseRequestRepository,
  invoiceRepository,
} from '../../../repositories/index.js';
import type { PaginationQuery } from '../../../utils/pagination.js';
import { normalizePagination } from '../../../utils/pagination.js';

/** Flattens the related currency's code onto an inventory record (auto from currencyId). */
const withCurrencyCode = (item: any) => ({
  ...item,
  currencyCode: item?.currency?.code ?? null,
});

/** Reads a localized value out of a Prisma Json column, falling back to English. */
const localize = (value: unknown, lang: string): string => {
  if (typeof value === 'object' && value !== null) {
    const map = value as Record<string, string>;
    return map[lang] ?? map.en ?? '';
  }
  return '';
};

const isUniqueConstraintError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code: string }).code === 'P2002';

export const InventoryService = {
  // ─── Stats ──────────────────────────────────────────────
  async getStats(domainId: string) {
    const {
      totalItems,
      activeCount,
      inactiveCount,
      outOfStockCount,
      totalQuantity,
    } = await InventoryRepository.getStatsDetailed(domainId);

    const lowStockCount = await InventoryRepository.getLowStockCount(domainId);

    const uniqueProductCount =
      await InventoryRepository.countUniqueProducts(domainId);

    return {
      totalItems,
      activeCount,
      inactiveCount,
      totalQuantity,
      lowStockCount,
      outOfStockCount,
      uniqueProductCount,
    };
  },

  // ─── List ───────────────────────────────────────────────
  async listInventory(
    domainId: string,
    query: PaginationQuery & { status?: 'ACTIVE' | 'INACTIVE' },
  ) {
    const { offset, limit } = normalizePagination(query);

    const [totalCount, items] = await InventoryRepository.listByDomain(
      domainId,
      limit,
      offset,
      query.status,
    );

    return {
      items: items.map(withCurrencyCode),
      pagination: {
        totalCount,
        offset,
        limit,
      },
    };
  },

  // ─── Create Entry ──────────────────────────────────────
  async createEntry(
    domainId: string,
    adminId: string,
    data: {
      productId: string;
      productGradeId: string;
      quantity: number;
      uomId: string;
      reorderLevel?: number;
      price?: number;
      currencyId?: string;
    },
  ) {
    // Validate product exists & belongs to domain
    const product = await ProductRepository.findByIdAndDomain(
      data.productId,
      domainId,
    );
    if (!product) throw new Error(Messages.INVENTORY.PRODUCT_NOT_FOUND);

    // Validate grade exists & belongs to product
    const grade = await ProductGradeRepository.findFirst({
      where: {
        id: data.productGradeId,
        productId: data.productId,
        domainId,
        isDeleted: false,
      },
    });
    if (!grade) throw new Error(Messages.INVENTORY.GRADE_NOT_FOUND);

    // Validate UOM exists & belongs to domain
    const uom = await uomRepository.findByIdAndDomain(data.uomId, domainId);
    if (!uom) throw new Error(Messages.INVENTORY.UOM_NOT_FOUND);

    // Validate currency (optional) belongs to this admin's enabled currencies
    if (data.currencyId) {
      const validCurrency = await AdminCurrencyRepository.validateCurrencyIds(
        adminId,
        [data.currencyId],
      );
      if (!validCurrency) {
        throw new Error(Messages.INVENTORY.INVALID_CURRENCY);
      }
    }

    try {
      const created = await InventoryRepository.create({
        productId: data.productId,
        productGradeId: data.productGradeId,
        quantity: data.quantity,
        uomId: data.uomId,
        reorderLevel: data.reorderLevel ?? 0,
        price: data.price ?? null,
        currencyId: data.currencyId ?? null,
        domainId,
      });
      return withCurrencyCode(created);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new Error(Messages.INVENTORY.DUPLICATE_ENTRY);
      }
      throw error;
    }
  },

  // ─── Reorder Level Update ──────────────────────────────
  async updateReorderLevel(domainId: string, id: string, reorderLevel: number) {
    const record = await InventoryRepository.findByIdAndDomain(id, domainId);
    if (!record) throw new Error(Messages.INVENTORY.NOT_FOUND);

    const updated = await InventoryRepository.update(id, { reorderLevel });
    return withCurrencyCode(updated);
  },

  // ─── Delete Entry ──────────────────────────────────────
  async deleteEntry(domainId: string, id: string) {
    const record = await InventoryRepository.findByIdAndDomain(id, domainId);
    if (!record) throw new Error(Messages.INVENTORY.NOT_FOUND);

    return InventoryRepository.softDelete(id);
  },

  // ─── Export (one subsheet per language) ────────────────
  async exportExcel(domainId: string, adminId: string, lang?: string) {
    const enabledLangs =
      await AdminLanguageRepository.getEnabledLanguageCodes(adminId);

    // Fill only the requested language's tab, or every domain language's tab.
    let langs: string[];
    if (lang) {
      if (!enabledLangs.includes(lang)) {
        throw new Error(Messages.INVENTORY.INVALID_LANGUAGE);
      }
      langs = [lang];
    } else {
      langs = enabledLangs;
    }
    if (langs.length === 0) {
      throw new Error(Messages.INVENTORY.NO_DOMAIN_LANGUAGES);
    }

    const records = await InventoryRepository.exportAll(domainId);

    const columns = [
      'productCode',
      'productName',
      'productGradeCode',
      'productGradeName',
      'uomCode',
      'uomName',
      'quantity',
      'reorderLevel',
      'price',
      'currencyCode',
      'currencyName',
    ];

    const worksheets = langs.map((code) => {
      const rows = records.map((item: any) => ({
        productCode: item.product.code,
        productName: localize(item.product.displayName, code),
        productGradeCode: item.productGrade.gradeCode,
        productGradeName: localize(item.productGrade.gradeDisplayName, code),
        uomCode: item.uom.code,
        uomName: localize(item.uom.displayName, code),
        quantity: item.quantity,
        reorderLevel: item.reorderLevel,
        price: item.price ?? '',
        currencyCode: item.currency?.code ?? '',
        currencyName: item.currency ? localize(item.currency.name, code) : '',
      }));
      return {
        name: code,
        columns,
        rows,
      };
    });

    return worksheets;
  },

  // ─── Import (scan each language tab, feed the DB) ──────
  async importExcel(filePath: string, domainId: string, adminId: string) {
    try {
      const workbook = XLSX.readFile(filePath);

      const enabledLangs = new Set(
        await AdminLanguageRepository.getEnabledLanguageCodes(adminId),
      );

      // Each tab is named by its language code; only process tabs whose
      // language belongs to this domain.
      const langSheets = workbook.SheetNames.filter((n) =>
        enabledLangs.has(n.trim()),
      );
      if (langSheets.length === 0) {
        throw new Error(Messages.INVENTORY.INVALID_LANGUAGE);
      }

      // Codes and quantities are the same across language tabs, so collapse
      // duplicates by product+grade and keep the first occurrence.
      const rowsByKey = new Map<string, any>();
      for (const sheetName of langSheets) {
        const sheetRows = XLSX.utils.sheet_to_json(
          workbook.Sheets[sheetName],
        ) as any[];
        for (const row of sheetRows) {
          const key = `${row.productCode}__${row.productGradeCode}`;
          if (!rowsByKey.has(key)) rowsByKey.set(key, row);
        }
      }
      const rows = [...rowsByKey.values()];

      const productCodes = [
        ...new Set(rows.map((r) => r.productCode).filter(Boolean)),
      ];
      const gradeCodes = [
        ...new Set(rows.map((r) => r.productGradeCode).filter(Boolean)),
      ];
      const uomCodes = [...new Set(rows.map((r) => r.uomCode).filter(Boolean))];
      const currencyCodes = [
        ...new Set(
          rows
            .map((r) => (r.currencyCode ? String(r.currencyCode).trim() : ''))
            .filter(Boolean),
        ),
      ];

      const [productMap, gradeMap, uomMap, currencyMap] = await Promise.all([
        ProductRepository.find(domainId, {
          filters: { codes: productCodes },
          select: { id: true, code: true },
        }).then((res) => new Map(res.map((r: any) => [r.code, r]))),
        ProductGradeRepository.find(domainId, {
          filters: { gradeCodes },
          select: { id: true, gradeCode: true, productId: true },
        }).then((res) => new Map(res.map((r: any) => [r.gradeCode, r]))),
        uomRepository
          .find(domainId, {
            filters: { codes: uomCodes },
            select: { id: true, code: true },
          })
          .then((res) => new Map(res.map((r: any) => [r.code, r]))),
        AdminCurrencyRepository.find({
          filters: { codes: currencyCodes, adminId, isEnabled: true },
          select: { currencyId: true, currency: { select: { code: true } } },
        }).then(
          (res: any[]) =>
            new Map(res.map((r: any) => [r.currency.code, r.currencyId])),
        ),
      ]);

      const failedRows: any[] = [];
      const validRows: {
        productId: string;
        productGradeId: string;
        domainId: string;
        uomId: string;
        quantity: number;
        reorderLevel: number;
        price: number | null;
        currencyId: string | null;
      }[] = [];

      for (const row of rows) {
        const product = productMap.get(row.productCode);
        const grade = gradeMap.get(row.productGradeCode);
        const uom = uomMap.get(row.uomCode);

        if (!product) {
          failedRows.push({
            ...row,
            error: `productCode "${row.productCode ?? ''}" not found in domain`,
          });
          continue;
        }
        if (!grade) {
          failedRows.push({
            ...row,
            error: `productGradeCode "${row.productGradeCode ?? ''}" not found in domain`,
          });
          continue;
        }
        if (!uom) {
          failedRows.push({
            ...row,
            error: `uomCode "${row.uomCode ?? ''}" not found in domain`,
          });
          continue;
        }
        if (grade.productId !== product.id) {
          failedRows.push({
            ...row,
            error: `productGradeCode "${row.productGradeCode ?? ''}" does not belong to productCode "${row.productCode ?? ''}"`,
          });
          continue;
        }

        const quantity = Number(row.quantity);
        const reorderLevel =
          row.reorderLevel === undefined || row.reorderLevel === ''
            ? 0
            : Number(row.reorderLevel);

        if (Number.isNaN(quantity) || quantity < 0) {
          failedRows.push({ ...row, error: 'Invalid quantity' });
          continue;
        }
        if (Number.isNaN(reorderLevel) || reorderLevel < 0) {
          failedRows.push({ ...row, error: 'Invalid reorderLevel' });
          continue;
        }

        // price is optional; when present it must be a valid non-negative number
        let price: number | null = null;
        if (row.price !== undefined && row.price !== '') {
          const parsedPrice = Number(row.price);
          if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
            failedRows.push({ ...row, error: 'Invalid price' });
            continue;
          }
          price = parsedPrice;
        }

        // currencyCode is optional; when present, fetch its currencyId and link
        // it. It must be one of the domain's (admin's) enabled currencies.
        let currencyId: string | null = null;
        const rowCurrencyCode = row.currencyCode
          ? String(row.currencyCode).trim()
          : '';
        if (rowCurrencyCode) {
          currencyId = currencyMap.get(rowCurrencyCode) ?? null;
          if (!currencyId) {
            failedRows.push({
              ...row,
              error: `currencyCode "${rowCurrencyCode}" not found in domain`,
            });
            continue;
          }
        }

        validRows.push({
          productId: product.id,
          productGradeId: grade.id,
          domainId,
          uomId: uom.id,
          quantity,
          reorderLevel,
          price,
          currencyId,
        });
      }

      let inserted = 0;
      for (const record of validRows) {
        await InventoryRepository.upsertEntry(record);
        inserted += 1;
      }

      return {
        processedLangs: langSheets,
        inserted,
        failed: failedRows.length,
        failedRows,
      };
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  },

  async getAnalytics(domainId: string) {
    const [
      rawMaterials,
      finishedProducts,
      pendingRequests,
      lowStock,
      openPOs,
      paidInvoices,
    ] = await Promise.all([
      ProductRepository.count({
        where: { domainId, productType: 'RAW_MATERIAL', isDeleted: false },
      }),
      ProductRepository.count({
        where: { domainId, productType: 'FINISHED_PRODUCT', isDeleted: false },
      }),
      RawMaterialPurchaseRequestRepository.count({
        where: { domainId, approvalStatus: 'PENDING', isDeleted: false },
      }),
      InventoryRepository.getLowStockCount(domainId),
      RawMaterialPurchaseRequestRepository.countPurchaseOrdersWhere({
        where: { domainId, orderStatus: 'PENDING_VENDOR', isDeleted: false },
      }),
      invoiceRepository.countWhere({
        where: { domainId, paymentStatus: 'PAID', isDeleted: false },
      }),
    ]);
    return {
      rawMaterials,
      finishedProducts,
      pendingRequests,
      lowStock,
      openPOs,
      payments: paidInvoices,
    };
  },
};
