import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS, PaginatedResponse, withId } from '../../shared';
import {
  Order,
  OrderItem,
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderStatus,
  OrderStats,
  PaginatedOrders,
} from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);

  getOrders(
    businessId: string,
    status?: OrderStatus,
    customerId?: string,
    limit?: number,
    page?: number,
  ): Observable<PaginatedOrders> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (customerId) params = params.set('customerId', customerId);
    if (limit) params = params.set('limit', limit);
    if (page) params = params.set('page', page);
    return this.http
      .get<PaginatedResponse<any>>(API_ENDPOINTS.ORDERS.BASE, { params })
      .pipe(map((res) => this.toPaginated(res)));
  }

  getOrderById(orderId: string, businessId: string): Observable<Order> {
    return this.http.get<any>(API_ENDPOINTS.ORDERS.BY_ID(orderId)).pipe(map((o) => this.mapOrder(o)));
  }

  createOrder(dto: CreateOrderDto): Observable<Order> {
    const payload = {
      customerId: dto.customerId,
      items: (dto.items ?? []).map((it) => ({
        resourceId: it.productId ?? it.serviceId,
        quantity: it.quantity,
      })),
    };
    return this.http.post<any>(API_ENDPOINTS.ORDERS.BASE, payload).pipe(map((o) => this.mapOrder(o)));
  }

  updateOrderStatus(orderId: string, businessId: string, dto: UpdateOrderStatusDto): Observable<Order> {
    return this.http
      .patch<any>(API_ENDPOINTS.ORDERS.STATUS(orderId), dto)
      .pipe(map((o) => this.mapOrder(o)));
  }

  getCustomerOrders(
    customerId: string,
    businessId: string,
    limit?: number,
    page?: number,
  ): Observable<PaginatedOrders> {
    return this.getOrders(businessId, undefined, customerId, limit, page);
  }

  searchOrders(
    businessId: string,
    query: string,
    limit?: number,
    page?: number,
  ): Observable<PaginatedOrders> {
    let params = new HttpParams().set('q', query);
    if (limit) params = params.set('limit', limit);
    if (page) params = params.set('page', page);
    return this.http
      .get<PaginatedResponse<any>>(API_ENDPOINTS.ORDERS.BASE, { params })
      .pipe(map((res) => this.toPaginated(res)));
  }

  /**
   * The new backend has no /orders/stats; derive totals client-side from a
   * single large page (the dashboard summary is the richer source).
   */
  getOrderStats(businessId: string, startDate?: string, endDate?: string): Observable<OrderStats> {
    return this.getOrders(businessId, undefined, undefined, 1000, 1).pipe(
      map(({ orders }) => ({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === OrderStatus.PENDING).length,
        completedOrders: orders.filter((o) => o.status === OrderStatus.COMPLETED).length,
        cancelledOrders: orders.filter((o) => o.status === OrderStatus.CANCELLED).length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      })),
    );
  }

  private toPaginated(res: PaginatedResponse<any>): PaginatedOrders {
    return {
      orders: (res.data ?? []).map((o) => this.mapOrder(o)),
      total: res.meta?.total ?? 0,
      page: res.meta?.page ?? 1,
      limit: res.meta?.limit ?? 20,
      totalPages: res.meta?.totalPages ?? 1,
    };
  }

  // Adapt the backend order (items keyed by resourceId/type) to the web shape.
  private mapOrder(o: any): Order {
    const order = withId(o) as any;
    order.items = (o.items ?? []).map((it: any): OrderItem => {
      const type = it.type ?? it.itemType;
      const resourceId = it.resourceId ?? it.productId ?? it.serviceId;
      return {
        id: it.id ?? it._id ?? resourceId,
        itemType: type,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        subTotal: it.subTotal,
        productId: type === 'product' ? resourceId : undefined,
        serviceId: type === 'service' ? resourceId : undefined,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      };
    });
    return order as Order;
  }
}
