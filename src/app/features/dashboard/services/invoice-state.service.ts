import { Injectable, computed, signal } from '@angular/core';
import { Invoice, InvoiceStatus } from '../../../core/models/invoice.model';
import { Customer } from '../../../core/models/customer.model';
import { Order } from '../../../core/models/order.model';

export type InvoiceTab = 'all' | 'draft' | 'sent' | 'paid' | 'overdue';

interface InvoiceFilters {
  searchQuery: string;
  status: InvoiceStatus | null;
  sortBy: 'createdAt' | 'totalAmount' | 'invoiceNumber' | 'dueDate';
  sortOrder: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceStateService {
  // Invoices state
  private readonly _invoices = signal<Invoice[]>([]);
  private readonly _invoicesLoading = signal(false);

  // Customers (for invoice creation)
  private readonly _customers = signal<Customer[]>([]);
  private readonly _customersLoading = signal(false);

  // Available orders (for invoice creation)
  private readonly _availableOrders = signal<Order[]>([]);
  private readonly _ordersLoading = signal(false);

  // UI state
  private readonly _activeTab = signal<InvoiceTab>('all');
  private readonly _filters = signal<InvoiceFilters>({
    searchQuery: '',
    status: null,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Modal state
  private readonly _isModalOpen = signal(false);
  private readonly _modalMode = signal<'create' | 'view'>('create');
  private readonly _selectedInvoice = signal<Invoice | null>(null);

  // Payment modal
  private readonly _isPaymentModalOpen = signal(false);
  private readonly _invoiceForPayment = signal<Invoice | null>(null);

  // Status modal
  private readonly _isStatusModalOpen = signal(false);
  private readonly _invoiceForStatus = signal<Invoice | null>(null);

  // Pagination
  private readonly _currentPage = signal(1);
  private readonly _pageSize = signal(10);
  private readonly _totalInvoices = signal(0);
  private readonly _totalPages = signal(1);

  // Public accessors
  readonly invoices = this._invoices.asReadonly();
  readonly invoicesLoading = this._invoicesLoading.asReadonly();
  readonly customers = this._customers.asReadonly();
  readonly customersLoading = this._customersLoading.asReadonly();
  readonly availableOrders = this._availableOrders.asReadonly();
  readonly ordersLoading = this._ordersLoading.asReadonly();
  readonly activeTab = this._activeTab.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly isModalOpen = this._isModalOpen.asReadonly();
  readonly modalMode = this._modalMode.asReadonly();
  readonly selectedInvoice = this._selectedInvoice.asReadonly();
  readonly isPaymentModalOpen = this._isPaymentModalOpen.asReadonly();
  readonly invoiceForPayment = this._invoiceForPayment.asReadonly();
  readonly isStatusModalOpen = this._isStatusModalOpen.asReadonly();
  readonly invoiceForStatus = this._invoiceForStatus.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly totalInvoices = this._totalInvoices.asReadonly();
  readonly totalPages = this._totalPages.asReadonly();

  // Computed values
  readonly filteredInvoices = computed(() => {
    const invoices = this._invoices();
    const { searchQuery, sortBy, sortOrder } = this._filters();
    const activeTab = this._activeTab();

    let filtered = invoices;

    // Filter by tab (status)
    if (activeTab !== 'all') {
      const statusMap: Record<InvoiceTab, InvoiceStatus | null> = {
        all: null,
        draft: InvoiceStatus.DRAFT,
        sent: InvoiceStatus.SENT,
        paid: InvoiceStatus.PAID,
        overdue: InvoiceStatus.OVERDUE
      };
      const status = statusMap[activeTab];
      if (status) {
        filtered = filtered.filter(i => i.status === status);
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        i.invoiceNumber.toLowerCase().includes(query) ||
        i.customer?.name?.toLowerCase().includes(query) ||
        i.customer?.email?.toLowerCase().includes(query)
      );
    }

    return this.sortInvoices(filtered, sortBy, sortOrder);
  });

  readonly paginatedInvoices = computed(() => {
    const filtered = this.filteredInvoices();
    const page = this._currentPage();
    const size = this._pageSize();
    const start = (page - 1) * size;
    return filtered.slice(start, start + size);
  });

  readonly displayedTotalInvoices = computed(() => this.filteredInvoices().length);

  readonly invoiceCounts = computed(() => {
    const invoices = this._invoices();
    return {
      all: invoices.length,
      draft: invoices.filter(i => i.status === InvoiceStatus.DRAFT).length,
      sent: invoices.filter(i => i.status === InvoiceStatus.SENT).length,
      paid: invoices.filter(i => i.status === InvoiceStatus.PAID).length,
      overdue: invoices.filter(i => i.status === InvoiceStatus.OVERDUE).length,
      partiallyPaid: invoices.filter(i => i.status === InvoiceStatus.PARTIALLY_PAID).length,
      cancelled: invoices.filter(i => i.status === InvoiceStatus.CANCELLED).length
    };
  });

  readonly totalRevenue = computed(() => {
    const invoices = this._invoices();
    return invoices
      .filter(i => i.status === InvoiceStatus.PAID)
      .reduce((sum, i) => sum + i.totalAmount, 0);
  });

  readonly totalOutstanding = computed(() => {
    const invoices = this._invoices();
    return invoices
      .filter(i => i.status === InvoiceStatus.SENT || i.status === InvoiceStatus.OVERDUE || i.status === InvoiceStatus.PARTIALLY_PAID)
      .reduce((sum, i) => sum + (i.totalAmount - i.amountPaid), 0);
  });

  // Actions
  setInvoices(invoices: Invoice[]): void {
    this._invoices.set(invoices);
  }

  setInvoicesLoading(loading: boolean): void {
    this._invoicesLoading.set(loading);
  }

  setCustomers(customers: Customer[]): void {
    this._customers.set(customers);
    // Re-enrich existing invoices with customer data
    this.enrichAllInvoicesWithCustomers();
  }

  private enrichAllInvoicesWithCustomers(): void {
    const customers = this._customers();
    if (customers.length === 0) return;

    this._invoices.update(invoices =>
      invoices.map(invoice => {
        // Skip if customer data is already present
        if (invoice.customer?.name) {
          return invoice;
        }
        // Find and attach customer
        const customer = customers.find(c => c.id === invoice.customerId);
        return customer ? { ...invoice, customer } : invoice;
      })
    );
  }

  setCustomersLoading(loading: boolean): void {
    this._customersLoading.set(loading);
  }

  setAvailableOrders(orders: Order[]): void {
    this._availableOrders.set(orders);
  }

  setOrdersLoading(loading: boolean): void {
    this._ordersLoading.set(loading);
  }

  setActiveTab(tab: InvoiceTab): void {
    this._activeTab.set(tab);
    this._currentPage.set(1);
  }

  setSearchQuery(query: string): void {
    this._filters.update(f => ({ ...f, searchQuery: query }));
    this._currentPage.set(1);
  }

  setStatusFilter(status: InvoiceStatus | null): void {
    this._filters.update(f => ({ ...f, status }));
    this._currentPage.set(1);
  }

  setSorting(sortBy: InvoiceFilters['sortBy'], sortOrder: InvoiceFilters['sortOrder']): void {
    this._filters.update(f => ({ ...f, sortBy, sortOrder }));
  }

  setCurrentPage(page: number): void {
    this._currentPage.set(page);
  }

  setPagination(total: number, totalPages: number): void {
    this._totalInvoices.set(total);
    this._totalPages.set(totalPages);
  }

  // Invoice actions
  addInvoice(invoice: Invoice): void {
    // Enrich invoice with customer data if not present
    const enrichedInvoice = this.enrichInvoiceWithCustomer(invoice);
    this._invoices.update(invoices => [enrichedInvoice, ...invoices]);
  }

  updateInvoice(updatedInvoice: Invoice): void {
    // Enrich invoice with customer data if not present
    const enrichedInvoice = this.enrichInvoiceWithCustomer(updatedInvoice);
    this._invoices.update(invoices =>
      invoices.map(i => i.id === enrichedInvoice.id ? enrichedInvoice : i)
    );
  }

  private enrichInvoiceWithCustomer(invoice: Invoice): Invoice {
    // If customer data is already present, return as-is
    if (invoice.customer?.name) {
      return invoice;
    }

    // Try to find customer from loaded customers list
    const customers = this._customers();
    const customer = customers.find(c => c.id === invoice.customerId);

    if (customer) {
      return { ...invoice, customer };
    }

    return invoice;
  }

  updateInvoiceStatus(invoiceId: string, status: InvoiceStatus): void {
    this._invoices.update(invoices =>
      invoices.map(i => i.id === invoiceId ? { ...i, status } : i)
    );
  }

  updateInvoicePayment(invoiceId: string, amountPaid: number, status: InvoiceStatus): void {
    this._invoices.update(invoices =>
      invoices.map(i => i.id === invoiceId ? { ...i, amountPaid, status } : i)
    );
  }

  // Modal actions
  openCreateModal(): void {
    this._modalMode.set('create');
    this._selectedInvoice.set(null);
    this._isModalOpen.set(true);
  }

  openViewModal(invoice: Invoice): void {
    this._modalMode.set('view');
    this._selectedInvoice.set(invoice);
    this._isModalOpen.set(true);
  }

  closeModal(): void {
    this._isModalOpen.set(false);
    this._selectedInvoice.set(null);
  }

  // Payment modal actions
  openPaymentModal(invoice: Invoice): void {
    this._invoiceForPayment.set(invoice);
    this._isPaymentModalOpen.set(true);
  }

  closePaymentModal(): void {
    this._isPaymentModalOpen.set(false);
    this._invoiceForPayment.set(null);
  }

  // Status modal actions
  openStatusModal(invoice: Invoice): void {
    this._invoiceForStatus.set(invoice);
    this._isStatusModalOpen.set(true);
  }

  closeStatusModal(): void {
    this._isStatusModalOpen.set(false);
    this._invoiceForStatus.set(null);
  }

  // Reset state
  reset(): void {
    this._invoices.set([]);
    this._activeTab.set('all');
    this._filters.set({
      searchQuery: '',
      status: null,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    this._currentPage.set(1);
    this._isModalOpen.set(false);
    this._selectedInvoice.set(null);
  }

  // Helper
  private sortInvoices(invoices: Invoice[], sortBy: string, sortOrder: string): Invoice[] {
    return [...invoices].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'invoiceNumber':
          comparison = a.invoiceNumber.localeCompare(b.invoiceNumber);
          break;
        case 'totalAmount':
          comparison = a.totalAmount - b.totalAmount;
          break;
        case 'dueDate':
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }
}
