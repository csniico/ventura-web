export const API_ENDPOINTS = {
  // Auth endpoints (token-based; mirrors the mobile app / new backend)
  AUTH: {
    SIGN_IN_PASSWORD: '/auth/sign-in-password',
    SIGN_IN_EMAIL: '/auth/sign-in-email', // request a passwordless OTP
    VERIFY_CODE: '/auth/verify-code',
    SIGN_IN_GOOGLE: '/auth/sign-in-google',
    SIGN_IN_APPLE: '/auth/sign-in-apple',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },

  // User endpoints
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    AVATAR: (id: string) => `/users/${id}/avatar`,
  },

  // Business endpoints
  BUSINESSES: {
    BASE: '/businesses',
    MINE: '/businesses/mine',
    CATEGORIES: '/businesses/categories',
    BY_ID: (id: string) => `/businesses/${id}`,
  },

  // Setup status
  SETUP: {
    STATUS: '/setup/status',
  },

  // Customer endpoints
  CUSTOMERS: {
    BASE: '/customers',
    BY_ID: (id: string) => `/customers/${id}`,
    IMPORT: '/customers/import',
  },

  // Appointment endpoints
  APPOINTMENTS: {
    BASE: '/appointments',
    BY_ID: (id: string) => `/appointments/${id}`,
    STATUS: (id: string) => `/appointments/${id}/status`,
  },

  // Resource endpoints (products & services, unified under /resources)
  RESOURCES: {
    BASE: '/resources',
    BY_ID: (id: string) => `/resources/${id}`,
  },

  // Order endpoints
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    STATUS: (id: string) => `/orders/${id}/status`,
  },

  // Invoice endpoints
  INVOICES: {
    BASE: '/invoices',
    BY_ID: (id: string) => `/invoices/${id}`,
    PAYMENT: (id: string) => `/invoices/${id}/payment`,
    STATUS: (id: string) => `/invoices/${id}/status`,
    SEND: (id: string) => `/invoices/${id}/send`,
  },

  // Dashboard endpoints (business is derived from the bearer token)
  DASHBOARD: {
    SUMMARY: '/dashboard/summary',
  },

  // File uploads (two-step presign flow)
  FILES: {
    PRESIGN: '/files/presign',
  },

  // Mail endpoints (best-effort)
  MAIL: {
    SEND: '/mailer/send-email',
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
