import { Messages } from '../../../constants/index.js';
import { uomRepository } from '../../../repositories/index.js';
import { normalizeStatus } from '../../../utils/validation.js';

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
      status?: 'ACTIVE' | 'INACTIVE';
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

    const { displayName, baseUomId, conversionRate, status } = dto;
    const searchText = Object.values(displayName || {})
      .join(' ')
      .toLowerCase();

    const record = await uomRepository.create({
      displayName,
      baseUomId,
      conversionRate,
      status: status ? normalizeStatus(status) : 'ACTIVE',
      code,
      domainId,
      searchText,
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
      status?: 'ACTIVE' | 'INACTIVE';
      searchKey?: string;
      [key: string]: any;
    },
    langCode?: string,
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

    const baseUomIds = uoms
      .map((u: any) => u.baseUomId)
      .filter((id): id is string => !!id);

    const baseUoms =
      baseUomIds.length > 0
        ? await uomRepository.findActiveByIds(baseUomIds)
        : [];

    const baseUomMap = new Map(baseUoms.map((bu: any) => [bu.id, bu]));

    const localizedUoms = uoms.map((uom: any) => {
      const baseUomRaw = uom.baseUomId ? baseUomMap.get(uom.baseUomId) : null;
      const baseUom = baseUomRaw
        ? {
            ...baseUomRaw,
            displayName: langCode
              ? UomService.localizeName(baseUomRaw.displayName, langCode)
              : baseUomRaw.displayName,
          }
        : null;

      return {
        ...uom,
        displayName: langCode
          ? UomService.localizeName(uom.displayName, langCode)
          : uom.displayName,
        baseUom,
      };
    });

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

    let baseUom = null;
    if (record.baseUomId) {
      const baseUomRaw = await uomRepository.findByIdAndDomain(
        record.baseUomId,
        domainId,
      );
      if (baseUomRaw) {
        baseUom = {
          ...baseUomRaw,
          displayName: language
            ? UomService.localizeName(baseUomRaw.displayName, language)
            : baseUomRaw.displayName,
        };
      }
    }

    if (language) {
      record.displayName = UomService.localizeName(
        record.displayName,
        language,
      );
    }

    return {
      ...record,
      baseUom,
    };
  },

  async update(
    domainId: string,
    id: string,
    dto: {
      displayName?: Record<string, string>;
      code?: string;
      baseUomId?: string;
      conversionRate?: number;
      status?: 'ACTIVE' | 'INACTIVE';
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

    const { displayName, baseUomId, conversionRate, status } = dto;

    const record = await uomRepository.update(id, {
      ...(displayName ? { displayName } : {}),
      ...(baseUomId ? { baseUomId } : {}),
      ...(conversionRate ? { conversionRate } : {}),
      ...(status ? { status: normalizeStatus(status) } : {}),
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

    const dependentUom = await uomRepository.findActiveByBaseUomId(id);
    if (dependentUom) {
      throw new Error(
        'please update all the uom where this uom act as baseUom',
      );
    }

    return uomRepository.softDelete(id);
  },
};
