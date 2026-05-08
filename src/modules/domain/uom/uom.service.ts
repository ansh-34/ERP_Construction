import prisma from '../../../infra/database/prisma/prisma.client.js';

export const UomService = {
  localizeName(value: any, langCode: string) {
    if (!value || typeof value !== 'object') return '';
    return value[langCode] || value.en || '';
  },

  async create(
    domainId: string,
    dto: {
      displayName: Record<string, string>;
      code?: string;
      status?: string;
      [key: string]: any;
    },
  ) {
    const incomingLanguageCodes: string[] = Object.keys(dto.displayName || {});
    if (!incomingLanguageCodes.includes('en')) {
      throw new Error('displayName in english is required');
    }

    const code = dto?.displayName?.en?.toString().toUpperCase().replace(/\s+/g, '_');
    const existing = await prisma.uom.findFirst({
      where: { code: code, domainId, isDeleted: false },
    });
    if (existing) {
      throw new Error(`UOM with code '${code}' already exists`);
    }

    return prisma.uom.create({
      data: { ...dto, domainId, isDeleted: false, code } as any,
    });
  },

  async findAll(
    domainId: string,
    query: {
      page?: string;
      limit?: string;
      status?: string;
      [key: string]: any;
    },
    langCode: string,
  ) {
    const page = parseInt(query.page ?? '1');
    const limit = parseInt(query.limit ?? '10');
    const skip = (page - 1) * limit;

    const where = {
      domainId,
      isDeleted: false,
      ...(query.status && { status: query.status }),
    };

    const [data, total] = await Promise.all([
      prisma.uom.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.uom.count({ where }),
    ]);

    const normalizedData = data.map((uom: any) => ({
      ...uom,
      displayName: UomService.localizeName(uom.displayName, langCode),
    }));

    return {
      data: normalizedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findOne(domainId: string, id: string, language: string | null = null) {
    const record: any = await prisma.uom.findFirst({
      where: { id, domainId, isDeleted: false },
    });
    if (!record) throw new Error('UOM not found');

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
      status?: string;
      [key: string]: any;
    },
  ) {
    await this.findOne(domainId, id);

    if (dto.displayName) {
      const incomingLanguageCodes: string[] = Object.keys(dto.displayName);
      if (!incomingLanguageCodes.includes('en')) {
        throw new Error('displayName in english is required');
      }
    }

    if (dto.code) {
      const conflict = await prisma.uom.findFirst({
        where: { code: dto.code, domainId, isDeleted: false, NOT: { id } },
      });
      if (conflict) {
        throw new Error(`UOM with code '${dto.code}' already exists`);
      }
    }

    return prisma.uom.update({
      where: { id },
      data: { ...dto, updatedAt: new Date() } as any,
    });
  },

  async softDelete(domainId: string, id: string) {
    await this.findOne(domainId, id);
    return prisma.uom.update({
      where: { id },
      data: { isDeleted: true },
    });
  },
};
