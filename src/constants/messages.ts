export const Messages = Object.freeze({
  COMMON: {
    SUCCESS: 'Operation completed successfully',
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',

    NOT_FOUND: 'Resource not found',
    BAD_REQUEST: 'Invalid request',
    INTERNAL_SERVER_ERROR: 'Something went wrong',
  },

  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_EXPIRED: 'Authentication token expired',
  },

  USER: {
    CREATED: 'User created successfully',
    UPDATED: 'User updated successfully',
    DELETED: 'User deleted successfully',

    NOT_FOUND: 'User not found',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
  },

  DOMAIN: {
    CREATED: 'Domain created successfully',
    UPDATED: 'Domain updated successfully',
    DELETED: 'Domain deleted successfully',

    NOT_FOUND: 'Domain not found',
    NAME_ALREADY_EXISTS: 'Domain name already exists',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
  },

  PRODUCT: {
    CREATED: 'Product created successfully',
    UPDATED: 'Product updated successfully',
    DELETED: 'Product deleted successfully',
    NOT_FOUND: 'Product not found',
  },
});
