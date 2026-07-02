import { errors } from './responses.js';

const idParam = {
  in: 'path' as const,
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
  description: 'Sale order ID',
};

const productIdParam = {
  in: 'path' as const,
  name: 'productId',
  required: true,
  schema: { type: 'string', format: 'uuid' },
  description: 'saleOrderProduct.id (from List Products response)',
};

const langHeader = {
  in: 'header' as const,
  name: 'lang',
  schema: { type: 'string', example: 'en' },
  description:
    'Language code (e.g. en, hi). Resolves product/grade/uom name fields to strings. Without it, List returns raw JSON; Get defaults to "en".',
};

const listParams = [
  { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
  { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 } },
  {
    in: 'query',
    name: 'orderStatus',
    schema: { type: 'string', enum: ['PENDING', 'INPROGRESS', 'INVOICED'] },
  },
  {
    in: 'query',
    name: 'paymentType',
    schema: { type: 'string', enum: ['CASH', 'CREDIT'] },
  },
  {
    in: 'query',
    name: 'customerId',
    schema: { type: 'string', format: 'uuid' },
  },
  {
    in: 'query',
    name: 'searchKey',
    schema: { type: 'string' },
    description: 'Search by ticket number, customer name, phone, remarks',
  },
  langHeader,
];

const orderExample = {
  id: 'e6d2aa1e-f784-45d4-bc01-ad27dfaad9d8',
  ticketNumber: 'TK-0008',
  date: '2026-06-24T10:17:58.425Z',
  entryType: 'MANUAL',
  customerId: 'a339bac0-d4cc-4468-a755-20a46ed06599',
  customerName: 'Acme Corp',
  customerPhone: '+919876543210',
  totalAmount: 12000,
  totalTaxAmount: 765,
  totalTransportationCharges: 500,
  totalRoyaltyCharges: 200,
  paymentType: 'CASH',
  orderStatus: 'PENDING',
  remarks: null,
  domainId: '32549b13-9fb7-44da-8f70-d943d997f956',
  adminId: '1da16956-db58-4216-81f1-30ca54876913',
  status: 'ACTIVE',
  isDeleted: false,
  createdAt: '2026-06-24T10:17:58.425Z',
  updatedAt: '2026-06-24T10:17:58.425Z',
  saleOrderProducts: [
    {
      id: '7b76615c-053b-4f38-9713-79236eddba73',
      saleOrderId: 'e6d2aa1e-f784-45d4-bc01-ad27dfaad9d8',
      productId: '33333333-3333-3333-3333-333333333301',
      productGradeId: '44444444-4444-4444-4444-444444444401',
      quantity: 20,
      uomId: '55555555-5555-5555-5555-555555555501',
      unitRate: 350,
      amount: 7000,
      taxAmount: 630,
      transportationCharge: 300,
      royaltyAmount: 150,
      status: 'ACTIVE',
      isDeleted: false,
      createdAt: '2026-06-24T10:17:58.429Z',
      updatedAt: '2026-06-24T10:17:58.429Z',
      product: {
        id: '33333333-3333-3333-3333-333333333301',
        code: 'PRD-001',
        name: 'Portland Cement',
      },
      productGrade: {
        id: '44444444-4444-4444-4444-444444444401',
        gradeCode: 'GRD-43',
        name: 'Grade 43',
      },
      uom: {
        id: '55555555-5555-5555-5555-555555555501',
        code: 'BAG',
        name: 'Bag',
      },
    },
    {
      id: 'f110dd3e-74d5-44c2-a7ac-7f2800cdacf3',
      saleOrderId: 'e6d2aa1e-f784-45d4-bc01-ad27dfaad9d8',
      productId: '33333333-3333-3333-3333-333333333302',
      productGradeId: null,
      quantity: 5,
      uomId: '55555555-5555-5555-5555-555555555501',
      unitRate: 1000,
      amount: 5000,
      taxAmount: 135,
      transportationCharge: 200,
      royaltyAmount: 50,
      status: 'ACTIVE',
      isDeleted: false,
      createdAt: '2026-06-24T10:17:58.433Z',
      updatedAt: '2026-06-24T10:17:58.433Z',
      product: {
        id: '33333333-3333-3333-3333-333333333302',
        code: 'PRD-002',
        name: 'Steel Bar',
      },
      productGrade: null,
      uom: {
        id: '55555555-5555-5555-5555-555555555501',
        code: 'BAG',
        name: 'Bag',
      },
    },
  ],
  customer: {
    id: 'a339bac0-d4cc-4468-a755-20a46ed06599',
    name: 'Acme Corp',
    phoneCode: '+91',
    phone: '9876543210',
    paymentTerms: 'CASH',
  },
};

const buildPaths = (base: string, tags: string[]) => ({
  [base]: {
    post: {
      tags,
      summary: 'Create sale order',
      description: [
        '`ticketNumber` — optional, auto-generated as TK-0001, TK-0002… per domain if omitted.',
        '`customerName` and `customerPhone` — auto-fetched from the Customer record, do not send them.',
        '`totalAmount`, `totalTaxAmount`, `totalTransportationCharges`, `totalRoyaltyCharges` — auto-summed from product lines, do not send them.',
        'Per product: `amount` is auto-calculated as `unitRate × quantity`. `taxAmount`, `transportationCharge`, `royaltyAmount` are optional and default to **0** if omitted.',
      ].join(' '),
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SaleOrderCreateBody' },
            example: {
              customerId: 'a339bac0-d4cc-4468-a755-20a46ed06599',
              ticketNumber: 'SO-2026-001',
              date: '2026-07-01T09:00:00.000Z',
              entryType: 'MANUAL',
              paymentType: 'CASH',
              orderStatus: 'PENDING',
              status: 'ACTIVE',
              remarks: 'First order for this customer',
              products: [
                {
                  productId: '33333333-3333-3333-3333-333333333301',
                  productGradeId: '44444444-4444-4444-4444-444444444401',
                  quantity: 20,
                  uomId: '55555555-5555-5555-5555-555555555501',
                  unitRate: 350,
                  taxAmount: 630,
                  transportationCharge: 300,
                  royaltyAmount: 150,
                },
                {
                  productId: '33333333-3333-3333-3333-333333333302',
                  quantity: 5,
                  uomId: '55555555-5555-5555-5555-555555555501',
                  unitRate: 1000,
                },
              ],
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Sale order created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SaleOrderSingleResponse' },
              example: {
                success: true,
                message: 'Sale order created successfully',
                data: orderExample,
              },
            },
          },
        },
        ...errors,
      },
    },
    get: {
      tags,
      summary: 'List sale orders',
      description:
        'Send `lang` header to flatten product/grade/uom name fields. Without it, name fields are raw JSON objects.',
      security: [{ bearerAuth: [] }],
      parameters: listParams,
      responses: {
        200: {
          description: 'Sale orders retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SaleOrderListResponse' },
              example: {
                success: true,
                message: 'Sale orders retrieved successfully',
                pagination: {
                  currentCount: 1,
                  totalCount: 8,
                  offset: 0,
                  limit: 10,
                },
                data: [orderExample],
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
      summary: 'Get sale order by ID',
      description: 'Defaults to `lang=en` if no lang header is sent.',
      security: [{ bearerAuth: [] }],
      parameters: [idParam, langHeader],
      responses: {
        200: {
          description: 'Sale order retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SaleOrderSingleResponse' },
              example: {
                success: true,
                message: 'Sale order retrieved successfully',
                data: orderExample,
              },
            },
          },
        },
        ...errors,
      },
    },
    put: {
      tags,
      summary: 'Update sale order',
      description:
        'All fields optional. **Product upsert logic**: keyed on `(productId + productGradeId + uomId)` — matching combo updates other fields; new combo is added; products not mentioned are left untouched. Omit `products` entirely to leave all products unchanged. `taxAmount`, `transportationCharge`, `royaltyAmount` default to **0** if omitted. Order totals are always re-calculated from all current product lines after update.',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SaleOrderUpdateBody' },
            example: {
              customerId: 'a339bac0-d4cc-4468-a755-20a46ed06599',
              ticketNumber: 'SO-2026-001',
              date: '2026-07-01T09:00:00.000Z',
              entryType: 'MANUAL',
              paymentType: 'CASH',
              orderStatus: 'INPROGRESS',
              status: 'ACTIVE',
              remarks: 'Updated remark',
              products: [
                {
                  productId: '33333333-3333-3333-3333-333333333301',
                  productGradeId: '44444444-4444-4444-4444-444444444401',
                  quantity: 30,
                  uomId: '55555555-5555-5555-5555-555555555501',
                  unitRate: 380,
                  taxAmount: 1026,
                  transportationCharge: 400,
                  royaltyAmount: 200,
                },
              ],
            },
          },
        },
      },
      responses: {
        200: {
          description:
            'Sale order updated successfully — P1 qty updated to 30, P2 Steel Bar untouched',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SaleOrderSingleResponse' },
              example: {
                success: true,
                message: 'Sale order updated successfully',
                data: {
                  ...orderExample,
                  orderStatus: 'INPROGRESS',
                  remarks: 'Updated remark',
                  updatedAt: '2026-06-24T10:18:21.311Z',
                  totalAmount: 16400,
                  totalTaxAmount: 1161,
                  totalTransportationCharges: 600,
                  totalRoyaltyCharges: 250,
                  saleOrderProducts: [
                    {
                      ...orderExample.saleOrderProducts[0],
                      quantity: 30,
                      unitRate: 380,
                      amount: 11400,
                      taxAmount: 1026,
                      transportationCharge: 400,
                      royaltyAmount: 200,
                    },
                    orderExample.saleOrderProducts[1],
                  ],
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
      summary: 'Delete sale order (soft delete)',
      description: 'Blocked if `orderStatus` is INVOICED.',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: {
          description: 'Sale order deleted successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SaleOrderDeleteResponse' },
              example: {
                success: true,
                message: 'Sale order deleted successfully',
                data: null,
              },
            },
          },
        },
        ...errors,
      },
    },
  },

  [`${base}/{id}/products`]: {
    get: {
      tags,
      summary: 'List products for a sale order',
      description: 'Defaults to `lang=en` if no lang header is sent.',
      security: [{ bearerAuth: [] }],
      parameters: [idParam, langHeader],
      responses: {
        200: {
          description: 'Sale order products retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SaleOrderProductListResponse',
              },
              example: {
                success: true,
                message: 'Sale order retrieved successfully',
                data: orderExample.saleOrderProducts,
              },
            },
          },
        },
        ...errors,
      },
    },
  },

  [`${base}/{id}/products/{productId}`]: {
    delete: {
      tags,
      summary: 'Remove a specific product line from a sale order',
      description:
        'Use the `saleOrderProduct.id` (from List Products response), NOT the product table id. Permanently removes the line.',
      security: [{ bearerAuth: [] }],
      parameters: [idParam, productIdParam],
      responses: {
        200: {
          description: 'Sale order product removed successfully',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Sale order product removed successfully',
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

export const SaleOrderPaths = {
  ...buildPaths('/api/domain/sale-orders', ['Domain Sale Orders']),
  ...buildPaths('/api/user/sale-orders', ['User Sale Orders']),
};
