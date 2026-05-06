export const InventorySchemas = {
  AddInventoryBody: {
    type: 'object',
    required: ['name', 'quantity'],
    properties: {
      name: { type: 'string' },
      quantity: { type: 'number' },
      reorderLevel: { type: 'number' },
      code: { type: 'string' },
    },
  },
};
