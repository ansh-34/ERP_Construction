import multer from 'multer';
import path from 'path';
import {
  ALLOWED_MEDIA_EXTENSIONS,
  ALLOWED_MEDIA_EXTENSIONS_MESSAGE,
  ALLOWED_MEDIA_MIME_TYPES,
} from '@constants/index';

const isAllowedUploadFile = (file: Express.Multer.File): boolean => {
  const extension = path.extname(file.originalname).slice(1).toLowerCase();
  return (
    ALLOWED_MEDIA_EXTENSIONS.includes(extension) &&
    ALLOWED_MEDIA_MIME_TYPES.includes(file.mimetype)
  );
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, callback) => {
    if (!isAllowedUploadFile(file)) {
      callback(
        new Error(
          `Unsupported file type. Allowed file extensions: ${ALLOWED_MEDIA_EXTENSIONS_MESSAGE}`,
        ),
      );
      return;
    }

    callback(null, true);
  },
});
