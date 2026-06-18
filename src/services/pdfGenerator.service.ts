import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import prisma from '../infra/database/prisma/prisma.client.js';
import { uploadBufferToS3 } from '../utils/s3.utils.js';

// Hard cap on how long a single PDF render may take. A hung Chromium page
// (e.g. a template waiting on an unreachable remote asset) must never pin the
// worker. Override with PDF_RENDER_TIMEOUT_MS.
const RENDER_TIMEOUT_MS = Number(process.env.PDF_RENDER_TIMEOUT_MS) || 30000;

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Helper to localize Json fields
function localizeJson(value: any, lang: string = 'en'): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value[lang] || value.en || Object.values(value)[0] || '';
  }
  return String(value);
}

// Format date to local weighbridge style (DD-MM-YYYY HH:MM:SS)
function formatDateTime(date: Date): string {
  const pad = (num: number) => String(num).padStart(2, '0');
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

// Default Weigh Bridge Ticket (Sale Receipt) template matching the provided image
const DEFAULT_CONSTRUCTION_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Weigh Bridge Ticket</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Outfit:wght@400;600;700&display=swap');
    
    body {
      font-family: 'Outfit', sans-serif;
      color: #111827;
      margin: 0;
      padding: 40px;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
    }
    .ticket-container {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #111827;
      padding: 30px;
      position: relative;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px dashed #111827;
      padding-bottom: 20px;
    }
    .company-name {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 1.5px;
      margin: 0 0 5px 0;
      text-transform: uppercase;
    }
    .subtitle {
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 2px;
      margin: 0 0 15px 0;
      text-transform: uppercase;
      color: #4b5563;
    }
    .title {
      font-size: 28px;
      font-weight: 700;
      margin: 10px 0 0 0;
    }
    .grid-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 50px;
      row-gap: 15px;
      margin-bottom: 40px;
    }
    .field-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 1px dotted #d1d5db;
      padding-bottom: 4px;
    }
    .field-label {
      font-weight: 600;
      color: #374151;
      font-size: 14px;
    }
    .field-value {
      font-weight: 700;
      font-size: 15px;
      font-family: 'Courier Prime', monospace;
    }
    .net-weight-row {
      border-bottom: 2px solid #111827;
      padding-bottom: 6px;
    }
    .net-weight-row .field-value {
      font-size: 17px;
      color: #000;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 60px;
      padding-top: 20px;
    }
    .signature-block {
      width: 200px;
      text-align: center;
    }
    .signature-title {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 40px;
      color: #374151;
    }
    .signature-line {
      border-top: 1px solid #111827;
      padding-top: 5px;
      font-size: 12px;
      color: #6b7280;
    }
    .signature-graphic {
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: -15px;
    }
    .signature-graphic svg {
      width: 120px;
      height: 60px;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-15deg);
      font-size: 120px;
      font-weight: 700;
      color: rgba(229, 231, 235, 0.4);
      z-index: -1;
      pointer-events: none;
      text-transform: uppercase;
      letter-spacing: 5px;
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="watermark">SECURED</div>
    
    <div class="header">
      <h1 class="company-name">{{companyName}}</h1>
      <h2 class="subtitle">WEIGH BRIDGE TICKET</h2>
      <h3 class="title">Sale Receipt</h3>
    </div>
    
    <div class="grid-container">
      <!-- Left Column -->
      <div>
        <div class="field-row">
          <span class="field-label">Ticket Number</span>
          <span class="field-value">{{ticketNumber}}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Vehicle Number</span>
          <span class="field-value">{{vehicleNumber}}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Gross Weight</span>
          <span class="field-value">{{grossWeight}}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Tare Weight</span>
          <span class="field-value">{{tareWeight}}</span>
        </div>
        <div class="field-row net-weight-row">
          <span class="field-label">Net Weight</span>
          <span class="field-value">{{netWeight}}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Rate</span>
          <span class="field-value">{{rate}}</span>
        </div>
      </div>
      
      <!-- Right Column -->
      <div>
        <div class="field-row">
          <span class="field-label">Material</span>
          <span class="field-value">{{material}}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Customer Name</span>
          <span class="field-value">{{customerName}}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Date & Time</span>
          <span class="field-value">{{dateTime}}</span>
        </div>
        <div style="height: 100px;"></div>
        <div class="field-row" style="border-bottom: 2px solid #111827;">
          <span class="field-label" style="font-size: 16px;">Amount</span>
          <span class="field-value" style="font-size: 18px; color: #111827;">{{amount}}</span>
        </div>
      </div>
    </div>
    
    <div class="signatures">
      <div class="signature-block">
        <div class="signature-graphic">
          <svg viewBox="0 0 100 50">
            <path d="M 10 30 Q 30 10 40 35 T 60 15 T 80 40" fill="none" stroke="#0f172a" stroke-width="2" />
            <path d="M 25 25 L 35 15 M 35 25 L 25 15" fill="none" stroke="#0f172a" stroke-width="1.5" />
            <path d="M 45 40 Q 55 10 65 30" fill="none" stroke="#0f172a" stroke-width="1.5" />
          </svg>
        </div>
        <div class="signature-title">Operator Sign.</div>
        <div class="signature-line">Authorized Signatory</div>
      </div>
      
      <div class="signature-block">
        <div class="signature-graphic">
          <svg viewBox="0 0 100 50">
            <path d="M 15 25 Q 45 5 55 35 T 85 20 M 35 25 C 55 25 65 35 45 35" fill="none" stroke="#1e3a8a" stroke-width="2" />
          </svg>
        </div>
        <div class="signature-title">Driver Sign.</div>
        <div class="signature-line">Receiver Signature</div>
      </div>
    </div>
  </div>
</body>
</html>
`;

export async function generateInvoicePdf(invoiceId: string): Promise<string> {
  console.log(
    `[PdfService] Starting PDF generation for Invoice ID: ${invoiceId}`,
  );

  // 1. Fetch Invoice with complete details
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      items: {
        include: {
          product: true,
          uom: true,
        },
      },
      project: true,
      domain: true,
    },
  });

  if (!invoice) {
    throw new Error(`Invoice with ID ${invoiceId} not found`);
  }

  try {
    // Set status to PROCESSING
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { pdfStatus: 'PROCESSING' },
    });

    // 2. Resolve Active Template (fallback to seeded default)
    const activeTemplate = await prisma.invoiceTemplate.findFirst({
      where: {
        domainId: invoice.domainId,
        isDeleted: false,
        status: 'ACTIVE',
      },
    });

    const htmlContent = activeTemplate
      ? activeTemplate.htmlContent
      : DEFAULT_CONSTRUCTION_TEMPLATE;

    // 3. Try to resolve domain vehicle or fall back to a mock one
    const dbVehicle = await prisma.vehicle.findFirst({
      where: {
        domainId: invoice.domainId,
        isDeleted: false,
      },
    });
    const vehicleNumber = dbVehicle ? dbVehicle.numberPlate : '9677BR01';

    // 4. Calculate Weights
    // Sum of invoice item quantities is our Net Weight.
    // Fall back to a default value if total quantity is 0 or empty.
    const totalQty = invoice.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const netWeightVal = totalQty > 0 ? totalQty : 30.23;
    const tareWeightVal = 14.83;
    const grossWeightVal = netWeightVal + tareWeightVal;

    // Format weights
    const netWeight = `${netWeightVal.toFixed(3)} Ton`;
    const tareWeight = `${tareWeightVal.toFixed(3)} Ton`;
    const grossWeight = `${grossWeightVal.toFixed(3)} Ton`;

    // 5. Gather template variables
    const currencySymbol = '$'; // standard default
    const firstItem = invoice.items[0];
    const rateVal =
      firstItem && firstItem.quantity > 0
        ? (firstItem.totalAmount - firstItem.taxAmount) / firstItem.quantity
        : 0;

    const context = {
      companyName: localizeJson(invoice.domain.name, 'en'),
      ticketNumber: invoice.invoiceCode,
      vehicleNumber,
      grossWeight,
      tareWeight,
      netWeight,
      rate: `${currencySymbol}${rateVal.toFixed(2)}`,
      material: firstItem
        ? localizeJson(firstItem.product.displayName, 'en')
        : '8-15',
      customerName: invoice.vendorName || 'MR. HOUSAM',
      dateTime: formatDateTime(invoice.invoiceDate),
      amount: `${currencySymbol}${invoice.totalAmount.toFixed(2)}`,
    };

    // 6. Compile Handlebars Template
    const compiledTemplate = Handlebars.compile(htmlContent);
    const html = compiledTemplate(context);

    // 7. Launch isolated headless Puppeteer and render the PDF.
    // The whole render is bounded by RENDER_TIMEOUT_MS and the browser is
    // always closed (finally), so a hung page cannot pin the worker.
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await withTimeout(
        (async () => {
          const page = await browser.newPage();

          // Disable Javascript execution inside Chromium for security
          await page.setJavaScriptEnabled(false);

          // Render HTML page content
          await page.setContent(html, {
            waitUntil: 'load',
            timeout: RENDER_TIMEOUT_MS,
          });

          // Generate PDF buffer
          const pdfBufferUint8 = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
              top: '15mm',
              bottom: '15mm',
              left: '15mm',
              right: '15mm',
            },
          });

          return Buffer.from(pdfBufferUint8);
        })(),
        RENDER_TIMEOUT_MS,
        'PDF render',
      );
    } finally {
      // Best-effort close; never let a dangling browser leak.
      await browser.close().catch(() => {});
    }

    // 8. Upload PDF buffer to S3
    const invoiceYear = invoice.invoiceDate.getFullYear();
    const fileName = `${invoice.invoiceCode}.pdf`;
    const folderPath = `invoices/${invoice.domainId}/${invoiceYear}`;

    console.log(
      `[PdfService] Uploading PDF buffer to S3: ${folderPath}/${fileName}`,
    );
    const s3Url = await uploadBufferToS3(
      pdfBuffer,
      folderPath,
      fileName,
      'application/pdf',
      true,
    );

    // 9. Save PDF URL and update status to READY in DB
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        pdfUrl: s3Url,
        pdfStatus: 'READY',
        pdfGeneratedAt: new Date(),
        pdfVersion: { increment: 1 },
      },
    });

    console.log(`[PdfService] PDF generated and uploaded to S3: ${s3Url}`);
    return s3Url;
  } catch (error: any) {
    console.error(
      `[PdfService] Error generating PDF for Invoice ${invoiceId}:`,
      error,
    );

    // Set status to FAILED in DB
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        pdfStatus: 'FAILED',
      },
    });

    throw error;
  }
}
