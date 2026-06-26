export const MediaSchemas = {
  SupportedMediaFileTypes: {
    type: 'string',
    example:
      'Supported file extensions: jpg, jpeg, png, mp4, mov, avi, mkv, webm, pdf, doc, docx, xls, xlsx, csv, txt',
  },
  MediaObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string', example: 'Site progress image' },
      type: { type: 'string', example: 'image/jpeg' },
      url: {
        type: 'string',
        format: 'uri',
        example: 'https://example-bucket.s3.amazonaws.com/media/image.jpg',
      },
      domainId: { type: 'string', format: 'uuid' },
      adminId: { type: 'string', format: 'uuid' },
      status: { type: 'string', example: 'ACTIVE' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  CreateMediaBody: {
    type: 'object',
    required: ['files'],
    properties: {
      files: {
        type: 'array',
        items: {
          type: 'string',
          format: 'binary',
        },
        description:
          'Supported media files to upload. Allowed extensions: jpg, jpeg, png, mp4, mov, avi, mkv, webm, pdf, doc, docx, xls, xlsx, csv, txt.',
      },
      name: {
        type: 'string',
        example: 'Site progress image',
        description:
          'Optional compatibility field for a single uploaded file. Use names for multiple files.',
      },
      names: {
        type: 'array',
        items: {
          type: 'string',
        },
        example: ['Front view', 'Side view'],
        description:
          'Optional names paired with files by position. Missing names use the original filenames.',
      },
      domainId: {
        type: 'string',
        format: 'uuid',
        description:
          'Required only by domain media validation. User media uses token domain.',
      },
    },
  },
  CreateUserMediaBody: {
    type: 'object',
    required: ['files'],
    properties: {
      files: {
        type: 'array',
        items: {
          type: 'string',
          format: 'binary',
        },
        description:
          'Supported media files to upload. Allowed extensions: jpg, jpeg, png, mp4, mov, avi, mkv, webm, pdf, doc, docx, xls, xlsx, csv, txt.',
      },
      name: {
        type: 'string',
        example: 'User site progress image',
        description:
          'Optional compatibility field for a single uploaded file. Use names for multiple files.',
      },
      names: {
        type: 'array',
        items: {
          type: 'string',
        },
        example: ['Front view', 'Side view'],
        description:
          'Optional names paired with files by position. Missing names use the original filenames.',
      },
    },
  },
  UpdateMediaBody: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        example: 'Updated Site Photo',
      },
      type: {
        type: 'string',
        example: 'image/jpeg',
      },
    },
  },
};
