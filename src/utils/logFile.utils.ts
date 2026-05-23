import fs from 'fs';
import path from 'path';

export const LOG_DIR = path.resolve(process.cwd(), 'logs');

export function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

/** Local calendar date as DDMMYYYY (matches request logger filenames). */
export function formatLogDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}${mm}${yyyy}`;
}

export function getLogFileName(date: Date): string {
  return `log${formatLogDate(date)}.log`;
}

export function getLogFilePath(date: Date): string {
  return path.join(LOG_DIR, getLogFileName(date));
}

/** Yesterday at local midnight (same day boundary as log filenames). */
export function getYesterday(): Date {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  return yesterday;
}

/** Parses `logDDMMYYYY.log` into a UTC date-only value for DB storage. */
export function parseDateFromLogFileName(fileName: string): Date | null {
  const match = /^log(\d{2})(\d{2})(\d{4})\.log$/.exec(fileName);
  if (!match) {
    return null;
  }

  const [, dd, mm, yyyy] = match;
  const date = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
  return Number.isNaN(date.getTime()) ? null : date;
}
