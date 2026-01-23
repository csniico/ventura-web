import { Customer } from './customer.model';

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ItemType {
  PRODUCT = 'product',
  SERVICE = 'service'
}

export interface OrderItem {
  id: string;
  itemType: ItemType;
  name: string;
  price: number;
  quantity: number;
  subTotal: number;
  productId?: string;
  serviceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  businessId: string;
  customerId: string;
  invoiceId?: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  customer?: Customer;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemDto {
  itemType: ItemType;
  name: string;
  price: number;
  quantity: number;
  productId?: string;
  serviceId?: string;
}

export interface CreateOrderDto {
  businessId: string;
  customerId: string;
  items: CreateOrderItemDto[];
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface GetOrdersParams {
  businessId: string;
  status?: OrderStatus;
  customerId?: string;
  page?: number;
  limit?: number;
}

export interface SearchOrdersParams {
  businessId: string;
  q: string;
  filters?: 'on' | 'off';
  startDate?: string;
  endDate?: string;
  minTotal?: number;
  maxTotal?: number;
  limit?: number;
  page?: number;
}

export interface GetOrderStatsParams {
  businessId: string;
  startDate?: string;
  endDate?: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

export interface PaginatedOrders {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
