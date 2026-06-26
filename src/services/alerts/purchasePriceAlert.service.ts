import type { Prisma } from '@infra/database/prisma/generated/prisma/client';
import {
  alertRepository,
  alertRuleRepository,
  notificationRepository,
  type PriceIncreaseAlertCandidate,
} from '@repositories/index';
import { alertRecipientService } from './alertRecipient.service';

export const PURCHASE_PRICE_ALERT_MODULE_CODE = 'PO';
export const PURCHASE_PRICE_INCREASE_ALERT_CODE = 'PURCHASE_PRICE_INCREASE';

const PURCHASE_PRICE_ENTITY_TYPE = 'INVOICE_ITEM';

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function percentageIncrease(currentPrice: number, lastPrice: number): number {
  if (lastPrice <= 0) return 0;
  return Math.round(((currentPrice - lastPrice) / lastPrice) * 10000) / 100;
}

async function getRule(domainId: string, adminId: string) {
  const existing = await alertRuleRepository.findByCode(
    domainId,
    adminId,
    PURCHASE_PRICE_ALERT_MODULE_CODE,
    PURCHASE_PRICE_INCREASE_ALERT_CODE,
  );
  if (existing) return existing;

  return alertRuleRepository.upsert({
    moduleCode: PURCHASE_PRICE_ALERT_MODULE_CODE,
    alertCode: PURCHASE_PRICE_INCREASE_ALERT_CODE,
    name: 'Purchase Price Increase',
    description:
      'Triggers when the current purchase price is higher than the last purchase price for the same product, grade, UOM, and purchase type.',
    config: {},
    severity: 'WARNING',
    isEnabled: true,
    domainId,
    adminId,
  });
}

async function createAlert(input: {
  domainId: string;
  adminId: string;
  candidate: PriceIncreaseAlertCandidate;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}) {
  const { domainId, adminId, candidate } = input;
  const existing = await alertRepository.findActiveByEntity(
    domainId,
    adminId,
    PURCHASE_PRICE_ALERT_MODULE_CODE,
    PURCHASE_PRICE_INCREASE_ALERT_CODE,
    PURCHASE_PRICE_ENTITY_TYPE,
    candidate.invoiceItemId,
  );
  if (existing) return;

  const productLabel = candidate.productGradeName
    ? `${candidate.productName} - ${candidate.productGradeName}`
    : candidate.productName;
  const currentPrice = roundMoney(candidate.currentPrice);
  const lastPrice = roundMoney(candidate.lastPrice);
  const increaseAmount = roundMoney(
    candidate.currentPrice - candidate.lastPrice,
  );
  const increasePercent = percentageIncrease(
    candidate.currentPrice,
    candidate.lastPrice,
  );
  const unit = candidate.uomCode ? `/${candidate.uomCode}` : '';
  const title = 'Purchase Price Increased';
  const message = `${productLabel} purchase price increased from ${lastPrice}${unit} to ${currentPrice}${unit} (${increasePercent}% higher).`;

  const metadata: Prisma.InputJsonValue = {
    invoiceId: candidate.invoiceId,
    invoiceCode: candidate.invoiceCode,
    invoiceItemId: candidate.invoiceItemId,
    purchaseOrderId: candidate.purchaseOrderId,
    productId: candidate.productId,
    productGradeId: candidate.productGradeId,
    uomId: candidate.uomId,
    uomCode: candidate.uomCode,
    purchaseType: candidate.purchaseType,
    vendorName: candidate.vendorName,
    lastVendorName: candidate.lastVendorName,
    currentPrice,
    lastPrice,
    increaseAmount,
    increasePercent,
    purchaseDate: candidate.purchaseDate.toISOString(),
  };

  const alert = await alertRepository.create({
    moduleCode: PURCHASE_PRICE_ALERT_MODULE_CODE,
    alertCode: PURCHASE_PRICE_INCREASE_ALERT_CODE,
    entityType: PURCHASE_PRICE_ENTITY_TYPE,
    entityId: candidate.invoiceItemId,
    title,
    message,
    severity: input.severity,
    metadata,
    domainId,
    adminId,
  });

  const recipients = await alertRecipientService.getRecipients({
    domainId,
    adminId,
    moduleCode: PURCHASE_PRICE_ALERT_MODULE_CODE,
  });
  const uniqueRecipients = new Map(
    recipients.map((recipient) => [
      `${recipient.recipientType}:${recipient.recipientId}`,
      recipient,
    ]),
  );

  await notificationRepository.createMany(
    [...uniqueRecipients.values()].map((recipient) => ({
      alertId: alert.id,
      recipientType: recipient.recipientType,
      recipientId: recipient.recipientId,
      title,
      message,
      domainId,
      adminId,
    })),
  );
}

export const purchasePriceAlertService = {
  async createPriceIncreaseAlerts(input: {
    domainId: string;
    adminId: string;
    candidates: PriceIncreaseAlertCandidate[];
  }): Promise<void> {
    if (input.candidates.length === 0) return;

    const rule = await getRule(input.domainId, input.adminId);
    if (!rule.isEnabled || rule.status !== 'ACTIVE') return;

    for (const candidate of input.candidates) {
      await createAlert({
        domainId: input.domainId,
        adminId: input.adminId,
        candidate,
        severity: rule.severity,
      });
    }
  },
};
