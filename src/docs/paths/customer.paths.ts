import { errors } from './responses.js';

const idParam = {
  in: 'path' as const,
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
  description: 'Customer ID',
};

const listParams = [
  { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
  { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 } },
  {
    in: 'query',
    name: 'status',
    schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
  },
  {
    in: 'query',
    name: 'searchKey',
    schema: { type: 'string' },
    description: 'Search by name, phone',
  },
];

const buildPaths = (base: string, tags: string[]) => ({
  [base]: {
    post: {
      tags,
      summary: 'Create customer',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CustomerCreateBody' },
            example: {
              name: 'Acme Corp',
              phoneCode: '+91',
              phone: '9876543210',
              paymentTerms: 'CASH',
              gstNumber: '29ABCDE1234F1Z5',
              billingName: 'Acme Corp Pvt Ltd',
              billingAddress: '12, MG Road, Bangalore',
              shippingAddress: '12, MG Road, Bangalore',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Customer created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CustomerSingleResponse' },
              example: {
                success: true,
                message: 'Customer created successfully',
                data: {
                  id: 'a339bac0-d4cc-4468-a755-20a46ed06599',
                  name: 'Acme Corp',
                  phoneCode: '+91',
                  phone: '9876543210',
                  paymentTerms: 'CASH',
                  gstNumber: '29ABCDE1234F1Z5',
                  billingName: 'Acme Corp Pvt Ltd',
                  billingAddress: '12, MG Road, Bangalore',
                  shippingAddress: '12, MG Road, Bangalore',
                  searchText: 'acme corp +91 9876543210',
                  locationId: null,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-24T07:18:45.609Z',
                  updatedAt: '2026-06-24T07:18:45.609Z',
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    get: {
      tags,
      summary: 'List customers',
      security: [{ bearerAuth: [] }],
      parameters: listParams,
      responses: {
        200: {
          description: 'Customers retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CustomerListResponse' },
              example: {
                success: true,
                message: 'Customers retrieved successfully',
                pagination: {
                  currentCount: 1,
                  totalCount: 1,
                  offset: 0,
                  limit: 10,
                },
                data: [
                  {
                    id: 'a339bac0-d4cc-4468-a755-20a46ed06599',
                    name: 'Acme Corp',
                    phoneCode: '+91',
                    phone: '9876543210',
                    paymentTerms: 'CASH',
                    gstNumber: '29ABCDE1234F1Z5',
                    billingName: 'Acme Corp Pvt Ltd',
                    billingAddress: '12, MG Road, Bangalore',
                    shippingAddress: '12, MG Road, Bangalore',
                    searchText: 'acme corp +91 9876543210',
                    locationId: null,
                    domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                    adminId: '1da16956-db58-4216-81f1-30ca54876913',
                    status: 'ACTIVE',
                    isDeleted: false,
                    createdAt: '2026-06-24T07:18:45.609Z',
                    updatedAt: '2026-06-24T07:18:45.609Z',
                  },
                ],
              },
            },
          },
        },
        ...errors,
      },
    },
  },

  [`${base}/{id}`]: {
    get: {
      tags,
      summary: 'Get customer by ID',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: {
          description: 'Customer retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CustomerSingleResponse' },
              example: {
                success: true,
                message: 'Customer retrieved successfully',
                data: {
                  id: 'a339bac0-d4cc-4468-a755-20a46ed06599',
                  name: 'Acme Corp',
                  phoneCode: '+91',
                  phone: '9876543210',
                  paymentTerms: 'CASH',
                  gstNumber: '29ABCDE1234F1Z5',
                  billingName: 'Acme Corp Pvt Ltd',
                  billingAddress: '12, MG Road, Bangalore',
                  shippingAddress: '12, MG Road, Bangalore',
                  searchText: 'acme corp +91 9876543210',
                  locationId: null,
                  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
                  adminId: '1da16956-db58-4216-81f1-30ca54876913',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-24T07:18:45.609Z',
                  updatedAt: '2026-06-24T07:18:45.609Z',
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    put: {
      tags,
      summary: 'Update customer',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CustomerUpdateBody' },
            example: {
              name: 'Acme Corp Updated',
              phone: '9999999999',
              paymentTerms: 'CREDIT',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Customer updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CustomerSingleResponse' },
              example: {
                success: true,
                message: 'Customer updated successfully',
                data: {
                  id: 'a339bac0-d4cc-4468-a755-20a46ed06599',
                  name: 'Acme Corp Updated',
                  phoneCode: '+91',
                  phone: '9999999999',
                  paymentTerms: 'CREDIT',
                  status: 'ACTIVE',
                  isDeleted: false,
                  createdAt: '2026-06-24T07:18:45.609Z',
                  updatedAt: '2026-06-24T09:00:00.000Z',
                },
              },
            },
          },
        },
        ...errors,
      },
    },
    delete: {
      tags,
      summary: 'Delete customer (soft delete)',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: {
          description: 'Customer deleted successfully',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Customer deleted successfully',
                data: null,
              },
            },
          },
        },
        ...errors,
      },
    },
  },
});

export const CustomerPaths = {
  ...buildPaths('/api/domain/customers', ['Domain Customers']),
  ...buildPaths('/api/user/customers', ['User Customers']),
};
