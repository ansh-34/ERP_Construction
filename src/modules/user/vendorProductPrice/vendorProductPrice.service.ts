import fs from 'fs';
import XLSX from 'xlsx';
import { Messages } from '../../../constants/index.js';
import { vendorProductPriceRepository } from '../../../repositories/index.js';
import prisma from '../../../infra/database/prisma/prisma.client.js';
import { translateResponse } from '../../../utils/translation.js';

export const VendorProductPriceService = {
  async create(
    domainId: string,
    dto: {
      vendorName: string;
      productId: string;
      productGradeId: string;
      uomId: string;
      price: number;
      productCode?: string;
      productGradeCode?: string;
      uomCode?: string;
      status?: 'ACTIVE' | 'INACTIVE';
    },
  ) {
    const existing = await vendorProductPriceRepository.findUnique(
      dto.vendorName,
      dto.productId,
      dto.productGradeId,
      dto.uomId,
      domainId,
    );

    if (existing) {
      throw new Error(Messages.VENDOR_PRODUCT_PRICE.ALREADY_EXISTS);
    }

    const record = await vendorProductPriceRepository.create({
      ...dto,
      domainId,
      searchText: dto.vendorName.toLowerCase(),
      isDeleted: false,
    } as any);

    return record;
  },

  async findAll(
    domainId: string,
    query: {
      page?: string;
      limit?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      [key: string]: any;
    },
    langCode?: string,
  ) {
    const page = parseInt(query.page ?? '1');
    const limit = parseInt(query.limit ?? '10');
    const skip = (page - 1) * limit;

    const [totalCount, data] = await vendorProductPriceRepository.listByDomain(
      domainId,
      limit,
      skip,
      {
        status: query.status,
        searchKey: query.searchKey,
      },
    );

    return {
      data: translateResponse(data, langCode),
      pagination: {
        total: totalCount,
        page,
        limit,
      },
    };
  },

  async findOne(domainId: string, id: string) {
    const record = await vendorProductPriceRepository.findByIdAndDomain(
      id,
      domainId,
    );
    if (!record) throw new Error(Messages.VENDOR_PRODUCT_PRICE.NOT_FOUND);
    return record;
  },

  async update(
    domainId: string,
    id: string,
    dto: {
      vendorName?: string;
      productId?: string;
      productGradeId?: string;
      uomId?: string;
      price?: number;
      productCode?: string;
      productGradeCode?: string;
      uomCode?: string;
      status?: 'ACTIVE' | 'INACTIVE';
    },
  ) {
    const existing = await vendorProductPriceRepository.findByIdAndDomain(
      id,
      domainId,
    );
    if (!existing) {
      throw new Error(Messages.VENDOR_PRODUCT_PRICE.NOT_FOUND);
    }

    const vendorName = dto.vendorName || existing.vendorName;
    const productId = dto.productId || existing.productId;
    const productGradeId = dto.productGradeId || existing.productGradeId;
    const uomId = dto.uomId || existing.uomId;

    if (dto.vendorName || dto.productId || dto.productGradeId || dto.uomId) {
      const duplicate = await vendorProductPriceRepository.findUnique(
        vendorName,
        productId,
        productGradeId,
        uomId,
        domainId,
      );

      if (duplicate && duplicate.id !== id) {
        throw new Error(Messages.VENDOR_PRODUCT_PRICE.ALREADY_EXISTS);
      }
    }

    const searchText = vendorName.toLowerCase();

    const record = await vendorProductPriceRepository.update(id, {
      ...dto,
      searchText,
    } as any);

    return record;
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

  async importExcel(filePath: string, domainId: string) {
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

      const [products, grades, uoms] = await Promise.all([
        prisma.product.findMany({
          where: { code: { in: productCodes }, domainId, isDeleted: false },
        }),
        prisma.productGrades.findMany({
          where: { gradeCode: { in: gradeCodes }, domainId, isDeleted: false },
        }),
        prisma.uom.findMany({
          where: { code: { in: uomCodes }, domainId, isDeleted: false },
        }),
      ]);

      const productMap = Object.fromEntries(products.map((p) => [p.code, p]));
      const gradeMap = Object.fromEntries(grades.map((g) => [g.gradeCode, g]));
      const uomMap = Object.fromEntries(uoms.map((u) => [u.code, u]));

      const finalData = [];
      const failedRows = [];

      for (const row of data) {
        if (!row.vendorName || !row.price) {
          failedRows.push({ ...row, error: 'Missing vendorName or price' });
          continue;
        }

        const product = productMap[row.productCode];
        const grade = gradeMap[row.productGradeCode];
        const uom = uomMap[row.uomCode];

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
        if (grade.productId !== product.id) {
          failedRows.push({ ...row, error: 'Grade mismatch for product' });
          continue;
        }

        finalData.push({
          vendorName: row.vendorName,
          productId: product.id,
          productGradeId: grade.id,
          uomId: uom.id,
          price: parseFloat(row.price),
          productCode: row.productCode,
          productGradeCode: row.productGradeCode,
          uomCode: row.uomCode,
          searchText: row.vendorName.toLowerCase(),
          domainId,
          status: 'ACTIVE' as any,
          isDeleted: false,
        });
      }

      if (finalData.length > 0) {
        const chunkSize = 1000;
        for (let i = 0; i < finalData.length; i += chunkSize) {
          await vendorProductPriceRepository.createMany(
            finalData.slice(i, i + chunkSize),
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
    const data = await vendorProductPriceRepository.findAllByDomain(domainId);

    const exportData = data.map((item) => ({
      vendorName: item.vendorName,
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
