import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin, takeUntil, catchError, of } from 'rxjs';
import { OrderService } from '../../../../core/services/order.service';
import { OrderStateService, OrderTab } from '../../services/order-state.service';
import { CustomerService } from '../../../../core/services/customer.service';
import { BusinessService } from '../../../../core/services/business.service';
import { Order, OrderStatus, CreateOrderDto } from '../../../../core/models/order.model';
import { SearchInputComponent } from '../../../../shared/components/search-input.component';
import { OrderListComponent } from './order-list.component';
import { OrderModalComponent } from './order-modal.component';
import { OrderStatusModalComponent } from './order-status-modal.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    SearchInputComponent,
    OrderListComponent,
    OrderModalComponent,
    OrderStatusModalComponent
  ],
  templateUrl: './orders.component.html'
})
export class OrdersComponent implements OnInit, OnDestroy {
  protected readonly orderState = inject(OrderStateService);
  private readonly orderService = inject(OrderService);
  private readonly customerService = inject(CustomerService);
  private readonly businessService = inject(BusinessService);
  private readonly destroy$ = new Subject<void>();

  protected readonly businessId = signal('');
  protected readonly toastMessage = signal('');
  protected readonly toastType = signal<'success' | 'error'>('success');

  protected readonly tabs: { key: OrderTab; label: string }[] = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  ngOnInit(): void {
    this.loadBusinessAndOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBusinessAndOrders(): void {
    this.orderState.setOrdersLoading(true);
    this.orderState.setStatsLoading(true);

    const currentBusiness = this.businessService.getCurrentBusiness();
    if (currentBusiness) {
      this.businessId.set(currentBusiness.id);
      this.loadData(currentBusiness.id);
      return;
    }

    this.businessService.fetchOwnerBusiness()
      .pipe(takeUntil(this.destroy$))
      .subscribe(business => {
        if (business) {
          this.businessId.set(business.id);
          this.loadData(business.id);
        }
      });
  }

  private loadData(businessId: string): void {
    forkJoin({
      orders: this.orderService.getOrders(businessId).pipe(catchError(() => of({ orders: [], total: 0, page: 1, limit: 20, totalPages: 1 }))),
      stats: this.orderService.getOrderStats(businessId).pipe(catchError(() => of({ totalOrders: 0, pendingOrders: 0, completedOrders: 0, cancelledOrders: 0, totalRevenue: 0 }))),
      customers: this.customerService.getCustomers(businessId).pipe(catchError(() => of([])))
    }).pipe(takeUntil(this.destroy$))
      .subscribe(({ orders, stats, customers }) => {
        this.orderState.setOrders(orders.orders);
        this.orderState.setPagination(orders.total, orders.totalPages);
        this.orderState.setStats(stats);
        this.orderState.setCustomers(customers);
        this.orderState.setOrdersLoading(false);
        this.orderState.setStatsLoading(false);
      });
  }

  protected getTabCount(tab: OrderTab): number {
    return this.orderState.orderCounts()[tab];
  }

  protected onTabChange(tab: OrderTab): void {
    this.orderState.setActiveTab(tab);
  }

  protected onSearch(query: string): void {
    this.orderState.setSearchQuery(query);
  }

  protected onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const [sortBy, sortOrder] = value.split('-') as ['createdAt' | 'totalAmount' | 'orderNumber', 'asc' | 'desc'];
    this.orderState.setSorting(sortBy, sortOrder);
  }

  protected onPageChange(page: number): void {
    this.orderState.setCurrentPage(page);
  }

  protected openCreateModal(): void {
    this.orderState.openCreateModal();
  }

  protected onViewOrder(order: Order): void {
    this.orderState.openViewModal(order);
  }

  protected onStatusChange(order: Order): void {
    this.orderState.openStatusModal(order);
  }

  protected onSaveOrder(dto: CreateOrderDto): void {
    this.orderService.createOrder(dto)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.showToast('Failed to create order', 'error');
          return of(null);
        })
      )
      .subscribe(order => {
        if (order) {
          this.orderState.addOrder(order);
          this.orderState.closeModal();
          this.showToast(`Order ${order.orderNumber} created successfully`, 'success');
          // Refresh stats
          this.loadStats();
        }
      });
  }

  protected onUpdateStatus(data: { orderId: string; status: OrderStatus }): void {
    this.orderService.updateOrderStatus(data.orderId, this.businessId(), { status: data.status })
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.showToast('Failed to update order status', 'error');
          return of(null);
        })
      )
      .subscribe(order => {
        if (order) {
          this.orderState.updateOrder(order);
          this.orderState.closeStatusModal();
          this.showToast(`Order status updated to ${data.status}`, 'success');
          // Refresh stats
          this.loadStats();
        }
      });
  }

  private loadStats(): void {
    this.orderService.getOrderStats(this.businessId())
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.orderState.setStats(stats);
      });
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }
}
