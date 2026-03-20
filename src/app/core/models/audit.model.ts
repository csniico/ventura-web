export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  RESTORE = 'RESTORE',
  ARCHIVE = 'ARCHIVE',
  SEND = 'SEND',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  CANCEL = 'CANCEL',
}

export enum AuditEntityType {
  USER = 'USER',
  BUSINESS = 'BUSINESS',
  APPOINTMENT = 'APPOINTMENT',
  CUSTOMER = 'CUSTOMER',
  ORDER = 'ORDER',
  ORDER_ITEM = 'ORDER_ITEM',
  INVOICE = 'INVOICE',
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  MAIL = 'MAIL',
  RESOURCE = 'RESOURCE',
  STORAGE = 'STORAGE',
  AUTH = 'AUTH',
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  entity: AuditEntityType;
  entityId: string;
  userId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface PaginatedAuditLogs {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
