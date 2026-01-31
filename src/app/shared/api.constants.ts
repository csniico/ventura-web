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
    REFRESH_TOKEN: '/auth/refresh-token',
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
    BY_OWNER: '/businesses/?search=owner',
    BY_BUSINESS_ID: (id: string) => `/businesses/?search=business&businessId=${id}`,
  },

  // Customer endpoints
  CUSTOMERS: {
    BASE: '/customers',
    BY_ID: (id: string, businessId: string) => `/customers/?filter=one&customerId=${id}&businessId=${businessId}`,
    BY_BUSINESS: (businessId: string, limit: number = 50, page: number = 1) =>
      `/customers/?filter=many&businessId=${businessId}&limit=${limit}&page=${page}`,
  },

  // Appointment endpoints
  APPOINTMENTS: {
    BASE: '/appointments',
    BY_USER: (userId: string) => `/appointments/user?userId=${userId}`,
    BY_BUSINESS: (businessId: string) => `/appointments/business?businessId=${businessId}`,
    BY_ID: (id: string) => `/appointments/${id}`,
  },

  // Resource endpoints (Products & Services)
  RESOURCES: {
    BASE: '/resources',
    // Main search endpoint - returns both products and services
    SEARCH: (businessId: string, query?: string, limit?: number, page?: number) => {
      let url = `/resources/search?businessId=${businessId}&q=${query || ''}`;
      if (limit) url += `&limit=${limit}`;
      if (page) url += `&page=${page}`;
      return url;
    },
    // Get single product by ID
    PRODUCT_BY_ID: (businessId: string, productId: string) =>
      `/resources/?type=product&filter=one&businessId=${businessId}&resourceId=${productId}`,
    // Get single service by ID
    SERVICE_BY_ID: (businessId: string, serviceId: string) =>
      `/resources/?type=service&filter=one&businessId=${businessId}&resourceId=${serviceId}`,
    // Create/Update/Delete
    CREATE_PRODUCT: '/resources/product',
    UPDATE_PRODUCT: (productId: string, businessId: string) =>
      `/resources/product/${productId}?businessId=${businessId}`,
    DELETE_PRODUCT: (productId: string, businessId: string) =>
      `/resources/product/${productId}?businessId=${businessId}`,
    CREATE_SERVICE: '/resources/service',
    UPDATE_SERVICE: (serviceId: string, businessId: string) =>
      `/resources/service/${serviceId}?businessId=${businessId}`,
    DELETE_SERVICE: (serviceId: string, businessId: string) =>
      `/resources/service/${serviceId}?businessId=${businessId}`,
  },

  // Storage endpoints
  STORAGE: {
    UPLOAD_IMAGE: '/assets/images',
  },

  // Mail endpoints
  MAIL: {
    SEND: '/mailer/send-email',
  },

  // Order endpoints
  ORDERS: {
    BASE: '/orders',
    CREATE: '/orders',
    LIST: (businessId: string, status?: string, customerId?: string, limit?: number, page?: number) => {
      let url = `/orders?businessId=${businessId}`;
      if (status) url += `&status=${status}`;
      if (customerId) url += `&customerId=${customerId}`;
      if (limit) url += `&limit=${limit}`;
      if (page) url += `&page=${page}`;
      return url;
    },
    BY_ID: (orderId: string, businessId: string) => `/orders/${orderId}?businessId=${businessId}`,
    UPDATE_STATUS: (orderId: string, businessId: string) => `/orders/${orderId}/status?businessId=${businessId}`,
    CUSTOMER_ORDERS: (customerId: string, businessId: string, limit?: number, page?: number) => {
      let url = `/orders/customer/${customerId}?businessId=${businessId}`;
      if (limit) url += `&limit=${limit}`;
      if (page) url += `&page=${page}`;
      return url;
    },
    SEARCH: (businessId: string, query: string, limit?: number, page?: number) => {
      let url = `/orders/search?businessId=${businessId}&q=${query}`;
      if (limit) url += `&limit=${limit}`;
      if (page) url += `&page=${page}`;
      return url;
    },
    STATS: (businessId: string, startDate?: string, endDate?: string) => {
      let url = `/orders/stats?businessId=${businessId}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      return url;
    },
  },

  // Invoice endpoints
  INVOICES: {
    BASE: '/invoices',
    CREATE: '/invoices',
    LIST: (businessId: string, status?: string, customerId?: string, limit?: number, page?: number) => {
      let url = `/invoices?businessId=${businessId}`;
      if (status) url += `&status=${status}`;
      if (customerId) url += `&customerId=${customerId}`;
      if (limit) url += `&limit=${limit}`;
      if (page) url += `&page=${page}`;
      return url;
    },
    BY_ID: (invoiceId: string, businessId: string) => `/invoices/${invoiceId}?businessId=${businessId}`,
    UPDATE_PAYMENT: (invoiceId: string, businessId: string) => `/invoices/${invoiceId}/payment?businessId=${businessId}`,
    UPDATE_STATUS: (invoiceId: string, businessId: string) => `/invoices/${invoiceId}/status?businessId=${businessId}`,
    CUSTOMER_INVOICES: (customerId: string, businessId: string, limit?: number, page?: number) => {
      let url = `/invoices/customer/${customerId}?businessId=${businessId}`;
      if (limit) url += `&limit=${limit}`;
      if (page) url += `&page=${page}`;
      return url;
    },
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