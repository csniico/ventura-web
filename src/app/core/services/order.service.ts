import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../shared/api.constants';
import {
  Order,
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderStatus,
  OrderStats,
  PaginatedOrders
} from '../models/order.model';

interface OrdersApiResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);

  getOrders(
    businessId: string,
    status?: OrderStatus,
    customerId?: string,
    limit?: number,
    page?: number
  ): Observable<PaginatedOrders> {
    return this.http.get<OrdersApiResponse>(
      API_ENDPOINTS.ORDERS.LIST(businessId, status, customerId, limit, page)
    ).pipe(
      map(response => ({
        orders: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 20,
        totalPages: response.totalPages || 1
      }))
    );
  }

  getOrderById(orderId: string, businessId: string): Observable<Order> {
    return this.http.get<Order>(
      API_ENDPOINTS.ORDERS.BY_ID(orderId, businessId)
    );
  }

  createOrder(dto: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(
      API_ENDPOINTS.ORDERS.CREATE,
      dto
    );
  }

  updateOrderStatus(orderId: string, businessId: string, dto: UpdateOrderStatusDto): Observable<Order> {
    return this.http.patch<Order>(
      API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId, businessId),
      dto
    );
  }

  getCustomerOrders(
    customerId: string,
    businessId: string,
    limit?: number,
    page?: number
  ): Observable<PaginatedOrders> {
    return this.http.get<OrdersApiResponse>(
      API_ENDPOINTS.ORDERS.CUSTOMER_ORDERS(customerId, businessId, limit, page)
    ).pipe(
      map(response => ({
        orders: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 20,
        totalPages: response.totalPages || 1
      }))
    );
  }

  searchOrders(
    businessId: string,
    query: string,
    limit?: number,
    page?: number
  ): Observable<PaginatedOrders> {
    return this.http.get<OrdersApiResponse>(
      API_ENDPOINTS.ORDERS.SEARCH(businessId, query, limit, page)
    ).pipe(
      map(response => ({
        orders: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 20,
        totalPages: response.totalPages || 1
      }))
    );
  }

  getOrderStats(
    businessId: string,
    startDate?: string,
    endDate?: string
  ): Observable<OrderStats> {
    return this.http.get<OrderStats>(
      API_ENDPOINTS.ORDERS.STATS(businessId, startDate, endDate)
    );
  }
}
