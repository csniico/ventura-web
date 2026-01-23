import { Injectable, signal, computed } from '@angular/core';
import { Customer } from '../../shared/models/customer.model';

export interface CustomerFilters {
  search: string;
  sortBy: 'name' | 'created' | 'updated';
  sortOrder: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class CustomerStateService {
  // State signals
  readonly customers = signal<Customer[]>([]);
  readonly selectedCustomer = signal<Customer | null>(null);
  readonly isLoading = signal(false);
  readonly totalCustomers = signal(0);
  readonly currentPage = signal(1);
  readonly pageSize = signal(25);
  readonly filters = signal<CustomerFilters>({
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Computed values
  readonly filteredCustomers = computed(() => {
    const customers = this.customers();
    const filters = this.filters();
    
    let filtered = customers;

    // Apply search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(search) ||
        customer.email?.toLowerCase().includes(search) ||
        customer.phone?.includes(search)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'updated':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  });

  readonly paginatedCustomers = computed(() => {
    const filtered = this.filteredCustomers();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return filtered.slice(start, start + size);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredCustomers().length / this.pageSize());
  });

  // Delete confirmation state
  readonly isDeleteModalOpen = signal(false);
  readonly customerToDelete = signal<Customer | null>(null);

  // Actions
  setCustomers(customers: Customer[]): void {
    this.customers.set(customers);
  }

  setSelectedCustomer(customer: Customer | null): void {
    this.selectedCustomer.set(customer);
  }

  setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  setTotalCustomers(total: number): void {
    this.totalCustomers.set(total);
  }

  setCurrentPage(page: number): void {
    this.currentPage.set(page);
  }

  setPageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1); // Reset to first page
  }

  updateFilters(filters: Partial<CustomerFilters>): void {
    this.filters.update(current => ({ ...current, ...filters }));
    this.currentPage.set(1); // Reset to first page when filtering
  }

  addCustomer(customer: Customer): void {
    this.customers.update(current => [...current, customer]);
  }

  updateCustomer(updatedCustomer: Customer): void {
    this.customers.update(current =>
      current.map(customer =>
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    );
  }

  removeCustomer(customerId: string): void {
    this.customers.update(current =>
      current.filter(customer => customer.id !== customerId)
    );
  }

  clearSelection(): void {
    this.selectedCustomer.set(null);
  }

  // Delete confirmation methods
  openDeleteModal(customer: Customer): void {
    this.customerToDelete.set(customer);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.customerToDelete.set(null);
    this.isDeleteModalOpen.set(false);
  }

  reset(): void {
    this.customers.set([]);
    this.selectedCustomer.set(null);
    this.isLoading.set(false);
    this.totalCustomers.set(0);
    this.currentPage.set(1);
    this.isDeleteModalOpen.set(false);
    this.customerToDelete.set(null);
    this.filters.set({
      search: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  }
}