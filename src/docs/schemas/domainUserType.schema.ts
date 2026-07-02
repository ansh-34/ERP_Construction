// //new: Request-body schemas for the redesigned UserType / DomainUserType modules.

const industryEnum = [
  'CONSTRUCTION',
  'MANUFACTURING',
  'MINING',
  'PROPERTY',
  'PROPERTY_MANAGEMENT',
];

export const DomainUserTypeSchemas = {
  // Full response object for a global user type — every field the API returns.
  UserTypeObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: {
        type: 'object',
        description: 'Localized name object.',
        example: { en: 'Site Engineer', ar: 'مهندس موقع' },
        additionalProperties: { type: 'string' },
      },
      code: {
        type: 'string',
        description: 'Auto-derived from name.en.',
        example: 'SITE_ENGINEER',
      },
      description: {
        type: 'string',
        nullable: true,
        example: 'On-site engineer',
      },
      industryType: {
        type: 'string',
        enum: industryEnum,
        example: 'CONSTRUCTION',
      },
      isDeleted: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  // Full response object for a domain↔user-type mapping, incl. embedded userType.
  DomainUserTypeObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      domainId: { type: 'string', format: 'uuid' },
      adminId: { type: 'string', format: 'uuid' },
      userTypeId: { type: 'string', format: 'uuid' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      userType: { $ref: '#/components/schemas/UserTypeObject' },
    },
  },
  CreateUserTypeBody: {
    type: 'object',
    required: ['name', 'industryType'],
    properties: {
      name: {
        type: 'object',
        description:
          'Localized user type name. English (en) key is required. `code` is auto-derived from `name.en`.',
        example: { en: 'Safety Officer', ar: 'ضابط السلامة' },
        additionalProperties: { type: 'string' },
      },
      description: { type: 'string', nullable: true, example: 'HSE officer' },
      industryType: {
        type: 'string',
        enum: industryEnum,
        example: 'CONSTRUCTION',
      },
    },
  },
  UpdateUserTypeBody: {
    type: 'object',
    description: 'At least one field is required.',
    properties: {
      name: {
        type: 'object',
        description:
          'Localized user type name. When `name.en` changes, `code` is re-derived.',
        example: { en: 'Senior Safety Officer' },
        additionalProperties: { type: 'string' },
      },
      description: {
        type: 'string',
        nullable: true,
        example: 'Lead HSE officer',
      },
      industryType: {
        type: 'string',
        enum: industryEnum,
        example: 'CONSTRUCTION',
      },
    },
  },
  MapDomainUserTypeBody: {
    type: 'object',
    required: ['userTypeIds'],
    properties: {
      userTypeIds: {
        type: 'array',
        minItems: 1,
        items: { type: 'string', format: 'uuid' },
        description: 'IDs of global user types to map into the domain.',
        example: [
          'edbe98ac-867d-4a19-89fa-4d695d401fd4',
          '17f69e43-411c-4e22-8608-e06ef734e0ad',
        ],
      },
    },
  },
};
