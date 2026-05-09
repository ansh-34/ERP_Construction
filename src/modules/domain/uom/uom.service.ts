import prisma from '../../../infra/database/prisma/prisma.client.js';
import { Messages } from '../../../constants/index.js';
import { uomRepository } from '../../../repositories/index.js';
import { normalizePagination } from '@/utils/pagination.js';

export const UomService = {
  localizeName(value: any, langCode: string) {
    if (!value || typeof value !== 'object') return '';
    return value[langCode] || value.en || '';
  },

  normalizeCode(value: string) {
    return value.toString().trim().toUpperCase().replace(/\s+/g, '_');
  },

  async create(
    domainId: string,
    dto: {
      displayName: Record<string, string>;
      baseUomId?: string;
      conversionRate: number;
      status?: string;
    },
    langCode: string = 'en',
  ) {
    const incomingLanguageCodes: string[] = Object.keys(dto.displayName || {});
    if (!incomingLanguageCodes.includes('en')) {
      throw new Error(Messages.UOM.DISPLAY_NAME_EN_REQUIRED);
    }

    const code = dto?.displayName?.en
      ?.toString()
      .toUpperCase()
      .replace(/\s+/g, '_');
    const existing = await uomRepository.findActiveByCode(domainId, code);
    if (existing) {
      throw new Error(Messages.UOM.CODE_ALREADY_EXISTS);
    }

    const record = await uomRepository.create({
      ...dto,
      code,
      domainId,
      isDeleted: false,
    } as any);

    return {
      ...record,
      displayName: UomService.localizeName(record.displayName, langCode),
    };
  },

  async findAll(
    domainId: string,
    query: {
      page?: string;
      limit?: string;
      status?: string;
      searchKey?: string;
      [key: string]: any;
    },
    langCode: string,
  ) {
    const page = parseInt(query.page ?? '1');
    const limit = parseInt(query.limit ?? '10');
    const skip = (page - 1) * limit;

    const [totalCount, uoms] = await uomRepository.listByDomain(
      domainId,
      limit,
      skip,
      {
        status: query.status,
        searchKey: query.searchKey,
      },
    );

    const localizedUoms = uoms.map((uom: any) => ({
      ...uom,
      displayName: UomService.localizeName(uom.displayName, langCode),
    }));

    return {
      data: localizedUoms,
      pagination: {
        total: totalCount,
        page,
        limit,
      },
    };
  },

  async findOne(domainId: string, id: string, language: string | null = null) {
    const record: any = await uomRepository.findByIdAndDomain(id, domainId);

    if (!record) throw new Error(Messages.UOM.NOT_FOUND);

    if (language) {
      record.displayName = UomService.localizeName(
        record.displayName,
        language,
      );
    }

    return record;
  },

  async update(
    domainId: string,
    id: string,
    dto: {
      displayName?: Record<string, string>;
      code?: string;
      baseUomId?: string;
      conversionRate?: number;
      status?: string;
    },
    langCode: string = 'en',
  ) {
    const existing = await uomRepository.findByIdAndDomain(id, domainId);
    if (!existing) {
      throw new Error(Messages.UOM.NOT_FOUND);
    }

    if (dto.displayName) {
      const incomingLanguageCodes: string[] = Object.keys(dto.displayName);
      if (!incomingLanguageCodes.includes('en')) {
        throw new Error(Messages.UOM.DISPLAY_NAME_EN_REQUIRED);
      }
    }

    let code: string | null = null;
    if (dto.code) {
      code = UomService.normalizeCode(dto.code);
      if (code !== (existing as any).code) {
        const duplicate = await uomRepository.findDuplicateCode(
          domainId,
          code,
          id,
        );
        if (duplicate) {
          throw new Error(Messages.UOM.CODE_ALREADY_EXISTS);
        }
      }
    }

    const searchText = dto.displayName
      ? Object.values(dto.displayName).join(' ').toLowerCase()
      : null;

    const record = await uomRepository.update(id, {
      ...dto,
      ...(code ? { code } : {}),
      ...(searchText ? { searchText } : {}),
    } as any);

    return {
      ...record,
      displayName: UomService.localizeName(record.displayName, langCode),
    };
  },

  async softDelete(domainId: string, id: string) {
    const existing = await uomRepository.findByIdAndDomain(id, domainId);
    if (!existing) {
      throw new Error(Messages.UOM.NOT_FOUND);
    }
    return uomRepository.softDelete(id);
  },
};
