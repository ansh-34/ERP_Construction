// Child process entrypoint for invoice PDF generation.
//
// Forked (one process per job) by the pg-boss worker so the heavy Puppeteer
// render runs fully isolated from the main API/queue process. Communicates the
// outcome back over IPC and exits, guaranteeing all Chromium/Prisma handles are
// torn down with the process.
import { generateInvoicePdf } from '../../services/pdfGenerator.service.js';

const invoiceId = process.argv[2];

(async () => {
  if (!invoiceId) {
    console.error('[pdfChild] missing invoiceId argument');
    process.exit(2);
  }

  console.log(
    `[pdfChild ${process.pid}] generating PDF for Invoice: ${invoiceId}`,
  );

  try {
    const url = await generateInvoicePdf(invoiceId);
    if (process.send) process.send({ ok: true, url });
    process.exit(0);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[pdfChild ${process.pid}] failed:`, message);
    if (process.send) process.send({ ok: false, error: message });
    process.exit(1);
  }
})();
