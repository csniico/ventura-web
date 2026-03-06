import { Injectable, computed, signal } from '@angular/core';
import { Order, OrderStatus, OrderStats } from '../../../core/models/order.model';
import { Customer } from '../../../core/models/customer.model';

export type OrderTab = 'all' | 'pending' | 'completed' | 'cancelled';

interface OrderFilters {
  searchQuery: string;
  status: OrderStatus | null;
  sortBy: 'createdAt' | 'totalAmount' | 'orderNumber';
  sortOrder: 'asc' | 'desc';
  startDate: string | null;
  endDate: string | null;
  minAmount: number | null;
  maxAmount: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class OrderStateService {
  // Orders state
  private readonly _orders = signal<Order[]>([]);
  private readonly _ordersLoading = signal(false);
  private readonly _stats = signal<OrderStats | null>(null);
  private readonly _statsLoading = signal(false);

  // Customers (for order creation)
  private readonly _customers = signal<Customer[]>([]);
  private readonly _customersLoading = signal(false);

  // UI state
  private readonly _activeTab = signal<OrderTab>('all');
  private readonly _filters = signal<OrderFilters>({
    searchQuery: '',
    status: null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    startDate: null,
    endDate: null,
    minAmount: null,
    maxAmount: null
  });

  // Modal state
  private readonly _isModalOpen = signal(false);
  private readonly _modalMode = signal<'create' | 'view'>('create');
  private readonly _selectedOrder = signal<Order | null>(null);

  // Status update modal
  private readonly _isStatusModalOpen = signal(false);
  private readonly _orderToUpdate = signal<Order | null>(null);

  // Pagination
  private readonly _currentPage = signal(1);
  private readonly _pageSize = signal(10);
  private readonly _totalOrders = signal(0);
  private readonly _totalPages = signal(1);

  // Public accessors
  readonly orders = this._orders.asReadonly();
  readonly ordersLoading = this._ordersLoading.asReadonly();
  readonly stats = this._stats.asReadonly();
  readonly statsLoading = this._statsLoading.asReadonly();
  readonly customers = this._customers.asReadonly();
  readonly customersLoading = this._customersLoading.asReadonly();
  readonly activeTab = this._activeTab.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly isModalOpen = this._isModalOpen.asReadonly();
  readonly modalMode = this._modalMode.asReadonly();
  readonly selectedOrder = this._selectedOrder.asReadonly();
  readonly isStatusModalOpen = this._isStatusModalOpen.asReadonly();
  readonly orderToUpdate = this._orderToUpdate.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly totalOrders = this._totalOrders.asReadonly();
  readonly totalPages = this._totalPages.asReadonly();

  // Computed values
  readonly filteredOrders = computed(() => {
    const orders = this._orders();
    const { searchQuery, sortBy, sortOrder, startDate, endDate, minAmount, maxAmount } = this._filters();
    const activeTab = this._activeTab();

    let filtered = orders;

    // Filter by tab (status)
    if (activeTab !== 'all') {
      filtered = filtered.filter(o => o.status === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.customer?.name?.toLowerCase().includes(query) ||
        o.customer?.email?.toLowerCase().includes(query)
      );
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate).getTime();
      filtered = filtered.filter(o => new Date(o.createdAt).getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate).getTime() + 86400000; // include end date
      filtered = filtered.filter(o => new Date(o.createdAt).getTime() < end);
    }

    // Filter by amount range
    if (minAmount !== null) {
      filtered = filtered.filter(o => o.totalAmount >= minAmount);
    }
    if (maxAmount !== null) {
      filtered = filtered.filter(o => o.totalAmount <= maxAmount);
    }

    return this.sortOrders(filtered, sortBy, sortOrder);
  });

  readonly paginatedOrders = computed(() => {
    const filtered = this.filteredOrders();
    const page = this._currentPage();
    const size = this._pageSize();
    const start = (page - 1) * size;
    return filtered.slice(start, start + size);
  });

  readonly displayedTotalOrders = computed(() => this.filteredOrders().length);

  readonly orderCounts = computed(() => {
    const orders = this._orders();
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
      completed: orders.filter(o => o.status === OrderStatus.COMPLETED).length,
      cancelled: orders.filter(o => o.status === OrderStatus.CANCELLED).length
    };
  });

  // Actions
  setOrders(orders: Order[]): void {
    this._orders.set(orders);
  }

  setOrdersLoading(loading: boolean): void {
    this._ordersLoading.set(loading);
  }

  setStats(stats: OrderStats): void {
    this._stats.set(stats);
  }

  setStatsLoading(loading: boolean): void {
    this._statsLoading.set(loading);
  }

  setCustomers(customers: Customer[]): void {
    this._customers.set(customers);
  }

  setCustomersLoading(loading: boolean): void {
    this._customersLoading.set(loading);
  }

  setActiveTab(tab: OrderTab): void {
    this._activeTab.set(tab);
    this._currentPage.set(1);
  }

  setSearchQuery(query: string): void {
    this._filters.update(f => ({ ...f, searchQuery: query }));
    this._currentPage.set(1);
  }

  setStatusFilter(status: OrderStatus | null): void {
    this._filters.update(f => ({ ...f, status }));
    this._currentPage.set(1);
  }

  setSorting(sortBy: OrderFilters['sortBy'], sortOrder: OrderFilters['sortOrder']): void {
    this._filters.update(f => ({ ...f, sortBy, sortOrder }));
  }

  setDateRange(startDate: string | null, endDate: string | null): void {
    this._filters.update(f => ({ ...f, startDate, endDate }));
    this._currentPage.set(1);
  }

  setAmountRange(minAmount: number | null, maxAmount: number | null): void {
    this._filters.update(f => ({ ...f, minAmount, maxAmount }));
    this._currentPage.set(1);
  }

  readonly hasActiveFilters = computed(() => {
    const f = this._filters();
    return !!(f.startDate || f.endDate || f.minAmount !== null || f.maxAmount !== null);
  });

  clearAdvancedFilters(): void {
    this._filters.update(f => ({
      ...f,
      startDate: null,
      endDate: null,
      minAmount: null,
      maxAmount: null
    }));
    this._currentPage.set(1);
  }

  setCurrentPage(page: number): void {
    this._currentPage.set(page);
  }

  setPagination(total: number, totalPages: number): void {
    this._totalOrders.set(total);
    this._totalPages.set(totalPages);
  }

  // Order actions
  addOrder(order: Order): void {
    this._orders.update(orders => [order, ...orders]);
  }

  updateOrder(updatedOrder: Order): void {
    this._orders.update(orders =>
      orders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
    );
  }

  updateOrderStatus(orderId: string, status: OrderStatus): void {
    this._orders.update(orders =>
      orders.map(o => o.id === orderId ? { ...o, status } : o)
    );
  }

  // Modal actions
  openCreateModal(): void {
    this._modalMode.set('create');
    this._selectedOrder.set(null);
    this._isModalOpen.set(true);
  }

  openViewModal(order: Order): void {
    this._modalMode.set('view');
    this._selectedOrder.set(order);
    this._isModalOpen.set(true);
  }

  closeModal(): void {
    this._isModalOpen.set(false);
    this._selectedOrder.set(null);
  }

  // Status modal actions
  openStatusModal(order: Order): void {
    this._orderToUpdate.set(order);
    this._isStatusModalOpen.set(true);
  }

  closeStatusModal(): void {
    this._isStatusModalOpen.set(false);
    this._orderToUpdate.set(null);
  }

  // Reset state
  reset(): void {
    this._orders.set([]);
    this._stats.set(null);
    this._activeTab.set('all');
    this._filters.set({
      searchQuery: '',
      status: null,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      startDate: null,
      endDate: null,
      minAmount: null,
      maxAmount: null
    });
    this._currentPage.set(1);
    this._isModalOpen.set(false);
    this._selectedOrder.set(null);
  }

  // Helper
  private sortOrders(orders: Order[], sortBy: string, sortOrder: string): Order[] {
    return [...orders].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'orderNumber':
          comparison = a.orderNumber.localeCompare(b.orderNumber);
          break;
        case 'totalAmount':
          comparison = a.totalAmount - b.totalAmount;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }
}
