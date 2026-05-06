import fs from 'fs/promises';
import path from 'path';
import variables from '@/config/variables.config';

const uploadRoot = path.resolve(process.cwd(), 'uploads');

function safeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export const uploadToS3 = async (
  file: Express.Multer.File,
  folder: string,
): Promise<string> => {
  const safeFolder = safeFileName(folder);
  const key = `${safeFolder}/${Date.now()}-${safeFileName(file.originalname)}`;
  const destination = path.join(uploadRoot, key);

  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, file.buffer);

  const port = variables.PORT || '5000';
  return `http://localhost:${port}/uploads/${key.replace(/\\/g, '/')}`;
};

export const deleteFromS3 = async (url: string): Promise<void> => {
  try {
    const marker = '/uploads/';
    const markerIndex = url.indexOf(marker);

    if (markerIndex === -1) {
      return;
    }

    const key = decodeURIComponent(url.slice(markerIndex + marker.length));
    const filePath = path.resolve(uploadRoot, key);

    if (!filePath.startsWith(uploadRoot)) {
      return;
    }

    await fs.unlink(filePath);
  } catch {
    // Best-effort cleanup.
  }
};
