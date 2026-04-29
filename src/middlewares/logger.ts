import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import variables from '../config/variables.config.js';

const LOG_DIR = path.join(process.cwd(), 'logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const formatDate = (date = new Date()) => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}${mm}${yyyy}`;
};

const getLogFilePath = () => {
  const date = formatDate();
  return path.join(LOG_DIR, `log_${date}.log`);
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (variables.LOGS_ENABLE !== 'true') {
    next();
    return;
  }

  const beforeTime = Date.now();
  const oldJson = res.json.bind(res);

  // Override the res.json method to intercept the response body
  res.json = (body: any) => {
    oldJson(body);

    const afterTime = Date.now();
    const responseTime = afterTime - beforeTime;

    // Asynchronously save the log so it doesn't block the request lifecycle
    saveLog(req, res, body, responseTime).catch((err) => {
      console.error('Failed to save request log:', err);
    });
    return res as any;
  };
  next();
};
async function saveLog(
  req: Request,
  res: Response,
  responseBody: any,
  responseTime: number,
) {
  const endpoint = req.originalUrl || req.url;
  const method = req.method;
  const statusCode = res.statusCode;

  // Safely stringify objects
  const requestData = req.body ? JSON.stringify(req.body) : null;
  const responseData = responseBody ? JSON.stringify(responseBody) : null;

  // Extract custom headers for device info
  const deviceId = (req.headers['x-device-id'] as string) || null;
  const appVersion = (req.headers['x-app-version'] as string) || null;

  // Try to get IP address
  const deviceIP = req.ip || req.socket.remoteAddress || null;

  const logObject = {
    timestamp: new Date().toISOString(),
    endpoint,
    method,
    statusCode,
    requestData,
    responseData,
    responseTime,
    deviceId,
    deviceIP,
    appVersion,
  };

  const logString = JSON.stringify(logObject);

  await fs.promises.appendFile(getLogFilePath(), logString + '\n');
}
