import { Messages } from '../../../constants/index.js';
import {
  weighBridgeRepository,
  UserRepository,
} from '../../../repositories/index.js';
import { normalizePagination } from '../../../utils/pagination.js';

function localizeName(value: unknown, lang: string): string {
  if (typeof value === 'object' && value !== null) {
    const map = value as Record<string, string>;
    return map[lang] ?? map.en ?? '';
  }
  return typeof value === 'string' ? value : '';
}

// lang === null → return the record untouched (project.name stays a raw JSON object).
// lang === string → flatten project.name to that language.
function localizeRecord(record: any, lang: string | null) {
  if (!record || lang === null) return record;
  return {
    ...record,
    project: record.project
      ? { ...record.project, name: localizeName(record.project.name, lang) }
      : record.project,
  };
}

type WeighBridgeDto = {
  ticketNumber?: string;
  date?: string;
  driverName: string;
  vehicleNo: string;
  supplier: string;
  material: string;
  gateNoteNo: string;
  tareWeight: string;
  grossWeight: string;
  weighBridgeStatus?: string;
  operatorId: string;
  remarks?: string;
  projectId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
};

async function generateTicketNumber(domainId: string): Promise<string> {
  const rows = await weighBridgeRepository.getTicketNumbers(domainId);
  const maxNum = rows.reduce((max, row) => {
    const m = row.ticketNumber.match(/^WB-(\d+)$/);
    return m ? Math.max(max, parseInt(m[1], 10)) : max;
  }, 0);
  return `WB-${String(maxNum + 1).padStart(4, '0')}`;
}

export const WeighBridgeService = {
  async create(domainId: string, adminId: string, dto: WeighBridgeDto) {
    const operator = await UserRepository.findActiveByIdAndDomain(
      dto.operatorId,
      domainId,
    );
    if (!operator) throw new Error('Operator not found');

    const ticketNumber =
      dto.ticketNumber ?? (await generateTicketNumber(domainId));

    return weighBridgeRepository.create({
      ticketNumber,
      date: dto.date ? new Date(dto.date) : new Date(),
      driverName: dto.driverName,
      vehicleNo: dto.vehicleNo,
      supplier: dto.supplier,
      material: dto.material,
      gateNoteNo: dto.gateNoteNo,
      tareWeight: dto.tareWeight,
      grossWeight: dto.grossWeight,
      weighBridgeStatus: dto.weighBridgeStatus ?? 'PENDING',
      operatorId: operator.id,
      operatorName: operator.name,
      remarks: dto.remarks ?? null,
      projectId: dto.projectId ?? null,
      status: dto.status ?? 'ACTIVE',
      domainId,
      adminId,
      isDeleted: false,
    });
  },

  async findAll(
    domainId: string,
    adminId: string,
    query: {
      offset?: number | string;
      limit?: number | string;
      status?: 'ACTIVE' | 'INACTIVE';
      weighBridgeStatus?: string;
      projectId?: string;
      searchKey?: string;
    },
    lang: string | null = null,
  ) {
    const { offset, limit } = normalizePagination(query);
    const [totalCount, data] = await weighBridgeRepository.listByDomain(
      domainId,
      adminId,
      limit,
      offset,
      {
        status: query.status,
        weighBridgeStatus: query.weighBridgeStatus,
        projectId: query.projectId,
        searchKey: query.searchKey,
      },
    );
    return {
      data: data.map((r: any) => localizeRecord(r, lang)),
      pagination: { totalCount, offset, limit },
    };
  },

  async findOne(
    domainId: string,
    adminId: string,
    id: string,
    lang: string | null = null,
  ) {
    const record = await weighBridgeRepository.findByIdAndDomain(
      id,
      domainId,
      adminId,
    );
    if (!record) throw new Error(Messages.WEIGH_BRIDGE.NOT_FOUND);
    return localizeRecord(record, lang);
  },

  async update(
    domainId: string,
    adminId: string,
    id: string,
    dto: Partial<WeighBridgeDto>,
  ) {
    const existing = await weighBridgeRepository.findByIdAndDomain(
      id,
      domainId,
      adminId,
    );
    if (!existing) throw new Error(Messages.WEIGH_BRIDGE.NOT_FOUND);

    const data: Record<string, any> = {};
    if (dto.ticketNumber !== undefined) data.ticketNumber = dto.ticketNumber;
    if (dto.date !== undefined) data.date = new Date(dto.date);
    if (dto.driverName !== undefined) data.driverName = dto.driverName;
    if (dto.vehicleNo !== undefined) data.vehicleNo = dto.vehicleNo;
    if (dto.supplier !== undefined) data.supplier = dto.supplier;
    if (dto.material !== undefined) data.material = dto.material;
    if (dto.gateNoteNo !== undefined) data.gateNoteNo = dto.gateNoteNo;
    if (dto.tareWeight !== undefined) data.tareWeight = dto.tareWeight;
    if (dto.grossWeight !== undefined) data.grossWeight = dto.grossWeight;
    if (dto.weighBridgeStatus !== undefined)
      data.weighBridgeStatus = dto.weighBridgeStatus;
    if (dto.operatorId !== undefined) {
      const operator = await UserRepository.findActiveByIdAndDomain(
        dto.operatorId,
        domainId,
      );
      if (!operator) throw new Error('Operator not found');
      data.operatorId = operator.id;
      data.operatorName = operator.name;
    }
    if (dto.remarks !== undefined) data.remarks = dto.remarks;
    if (dto.projectId !== undefined) data.projectId = dto.projectId;
    if (dto.status !== undefined) data.status = dto.status;

    return weighBridgeRepository.update(id, data);
  },

  async softDelete(domainId: string, adminId: string, id: string) {
    const existing = await weighBridgeRepository.findByIdAndDomain(
      id,
      domainId,
      adminId,
    );
    if (!existing) throw new Error(Messages.WEIGH_BRIDGE.NOT_FOUND);
    return weighBridgeRepository.softDelete(id);
  },
};
