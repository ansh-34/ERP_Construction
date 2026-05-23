import type { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import variables from '../config/variables.config.js';
import { ensureLogDir, getLogFilePath } from '../utils/logFile.utils.js';

ensureLogDir();

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

  res.json = (body: unknown) => {
    oldJson(body);

    const responseTime = Date.now() - beforeTime;
    saveLog(req, res, body, responseTime).catch((err) => {
      console.error('[RequestLogger] Failed to save request log:', err);
    });
    return res;
  };
  next();
};

async function saveLog(
  req: Request,
  res: Response,
  responseBody: unknown,
  responseTime: number,
) {
  const endpoint = req.originalUrl || req.url;
  const method = req.method;
  const statusCode = res.statusCode;

  const requestData = req.body ? JSON.stringify(req.body) : null;
  const responseData = responseBody ? JSON.stringify(responseBody) : null;

  const deviceId = (req.headers['x-device-id'] as string) || null;
  const appVersion = (req.headers['x-app-version'] as string) || null;
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

  await fs.appendFile(
    getLogFilePath(new Date()),
    `${JSON.stringify(logObject)}\n`,
  );
}
