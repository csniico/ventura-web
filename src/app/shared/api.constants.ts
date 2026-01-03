export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/signin',
    REGISTER: '/auth/signup',
    VERIFY_CODE: '/auth/verify-code',
    RESEND_CODE: '/auth/resend-code',
    CONFIRM_EMAIL: '/auth/confirm-email',
    RESET_PASSWORD: '/auth/reset-password',
    LOGOUT: '/auth/logout',
    GOOGLE_LOGIN: '/auth/google/login/web',
  },

  // User endpoints
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: (id: string) => `/users/profile/${id}`,
    CHANGE_PASSWORD: (id: string) => `/users/${id}/change-password`,
    RESET_PASSWORD: (id: string) => `/users/${id}/reset-password`,
  },

  // Business endpoints
  BUSINESSES: {
    BASE: '/businesses',
    BY_ID: (id: string) => `/businesses/${id}`,
  },

  // Appointment endpoints
  APPOINTMENTS: {
    BASE: '/appointments',
    BY_USER: '/appointments/user',
    BY_BUSINESS: '/appointments/business',
    BY_ID: (id: string) => `/appointments/${id}`,
  },

  // Storage endpoints
  STORAGE: {
    UPLOAD_IMAGE: '/assets/images',
  },

  // Mail endpoints
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