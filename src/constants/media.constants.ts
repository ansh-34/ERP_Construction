export const ALLOWED_MEDIA_FILE_TYPES = {
  IMAGE: {
    extensions: ['jpg', 'jpeg', 'png'],
    mimeTypes: ['image/jpeg', 'image/png'],
  },
  VIDEO: {
    extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    mimeTypes: [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
      'video/webm',
    ],
  },
  PDF: {
    extensions: ['pdf'],
    mimeTypes: ['application/pdf'],
  },
  DOCUMENT: {
    extensions: ['doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'],
    mimeTypes: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain',
    ],
  },
} as const;

export const ALLOWED_MEDIA_EXTENSIONS: readonly string[] = Object.values(
  ALLOWED_MEDIA_FILE_TYPES,
).flatMap((group) => group.extensions);

export const ALLOWED_MEDIA_MIME_TYPES: readonly string[] = Object.values(
  ALLOWED_MEDIA_FILE_TYPES,
).flatMap((group) => group.mimeTypes);

export const ALLOWED_MEDIA_EXTENSIONS_MESSAGE =
  ALLOWED_MEDIA_EXTENSIONS.join(', ');
