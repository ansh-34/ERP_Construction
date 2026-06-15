import { getBoss, PDF_QUEUE } from './pgBoss.js';

// Enqueue a PDF generation job onto the Postgres-backed (pg-boss) queue.
// Retries up to 3 times with exponential backoff, matching the previous behavior.
export async function enqueuePdfGeneration(invoiceId: string): Promise<void> {
  const boss = await getBoss();
  await boss.send(
    PDF_QUEUE,
    { invoiceId },
    { retryLimit: 3, retryBackoff: true },
  );
  console.log(`[Queue] Enqueued PDF generation for Invoice: ${invoiceId}`);
}
