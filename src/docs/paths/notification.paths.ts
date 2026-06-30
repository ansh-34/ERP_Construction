import { errors } from './responses.js';

const recipientTypeEnum = ['DOMAIN', 'ADMIN', 'USER'];

const idParam = {
  in: 'path',
  name: 'id',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

const notificationObject = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    alertId: { type: 'string', format: 'uuid', nullable: true },
    recipientType: {
      type: 'string',
      enum: recipientTypeEnum,
      example: 'DOMAIN',
    },
    recipientId: { type: 'string', format: 'uuid' },
    title: { type: 'string', example: 'Machine Fuel Usage High' },
    message: { type: 'string' },
    isRead: { type: 'boolean', example: false },
    readAt: { type: 'string', format: 'date-time', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

export const NotificationPaths = {
  '/api/domain/notifications': {
    get: {
      tags: ['Notifications'],
      summary: 'List notifications',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'offset',
          schema: { type: 'integer', minimum: 0 },
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100 },
        },
        {
          in: 'query',
          name: 'recipientType',
          schema: { type: 'string', enum: recipientTypeEnum },
        },
        {
          in: 'query',
          name: 'recipientId',
          schema: { type: 'string', format: 'uuid' },
        },
        { in: 'query', name: 'isRead', schema: { type: 'boolean' } },
      ],
      responses: {
        200: {
          description: 'Notifications fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Notifications fetched successfully',
                  },
                  data: { type: 'array', items: notificationObject },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/notifications/read-all': {
    put: {
      tags: ['Notifications'],
      summary: 'Mark all notifications as read',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Notifications marked as read successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Notifications marked as read successfully',
                  },
                  data: {
                    type: 'object',
                    properties: { count: { type: 'integer', example: 3 } },
                  },
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/notifications/{id}': {
    get: {
      tags: ['Notifications'],
      summary: 'Get notification by id',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: {
          description: 'Notification fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Notification fetched successfully',
                  },
                  data: notificationObject,
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
  '/api/domain/notifications/{id}/read': {
    put: {
      tags: ['Notifications'],
      summary: 'Mark notification as read',
      security: [{ bearerAuth: [] }],
      parameters: [idParam],
      responses: {
        200: {
          description: 'Notification marked as read successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Notification marked as read successfully',
                  },
                  data: notificationObject,
                },
              },
            },
          },
        },
        ...errors,
      },
    },
  },
};

Object.assign(NotificationPaths, {
  '/api/user/notifications': {
    get: {
      ...NotificationPaths['/api/domain/notifications'].get,
      tags: ['User Notifications'],
    },
  },
  '/api/user/notifications/read-all': {
    put: {
      ...NotificationPaths['/api/domain/notifications/read-all'].put,
      tags: ['User Notifications'],
    },
  },
  '/api/user/notifications/{id}': {
    get: {
      ...NotificationPaths['/api/domain/notifications/{id}'].get,
      tags: ['User Notifications'],
    },
  },
  '/api/user/notifications/{id}/read': {
    put: {
      ...NotificationPaths['/api/domain/notifications/{id}/read'].put,
      tags: ['User Notifications'],
    },
  },
});
