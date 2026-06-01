const vendorProperties = {
  code: { type: 'string', example: 'VND-001' },
  name: { type: 'string', example: 'Shree Cement Supplier' },
  email: { type: 'string', format: 'email', example: 'sales@example.com' },
  contactPerson: { type: 'string', example: 'Rahul Sharma' },
  phoneCode: { type: 'string', example: '+91' },
  phone: { type: 'string', example: '9876543210' },
  industry: { type: 'string', example: 'Cement Supplier' },
  address: { type: 'string', example: 'Jaipur, Rajasthan' },
  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' },
};

export const VendorSchemas = {
  CreateVendorBody: {
    type: 'object',
    required: ['code', 'name', 'email'],
    properties: vendorProperties,
  },
  UpdateVendorBody: {
    type: 'object',
    properties: vendorProperties,
  },
  VendorObject: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      ...vendorProperties,
      searchText: { type: 'string' },
      domainId: { type: 'string', format: 'uuid' },
      isDeleted: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
};
