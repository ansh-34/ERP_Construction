export const LanguageSchemas = {
  CreateLanguageBody: {
    type: 'object',
    required: ['name', 'code'],
    properties: {
      name: {},
      code: { type: 'string' },
    },
  },
};
