import { Component, inject, OnInit, OnDestroy, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { CustomerService } from '../../../../core/services/customer.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BusinessService } from '../../../../core/services/business.service';
import { Customer, CreateCustomerDto } from '../../../../shared/models/customer.model';
import { SearchInputComponent } from '../../../../shared/components/search-input.component';
import { CustomerListComponent } from './customer-list.component';
import { DeleteConfirmationComponent, DeleteConfirmationData } from '../../../../shared/components/delete-confirmation.component';
import { CustomerModalComponent } from './customer-modal.component';
import { CustomerImportModalComponent } from '../../components/customer-import-modal/customer-import-modal.component';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    SearchInputComponent,
    CustomerListComponent,
    CustomerModalComponent,
    DeleteConfirmationComponent,
    CustomerImportModalComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Customers</h1>
          <p class="text-sm text-gray-600 mt-1">Manage your customer database</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            (click)="isImportModalOpen.set(true)"
            class="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            Import CSV
          </button>
          <button
            (click)="openCreateModal()"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Add Customer
          </button>
        </div>
      </div>

      <!-- Stats Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Customers</p>
              <p class="text-2xl font-semibold text-gray-900">{{ customerState.totalCustomers() }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0 p-3 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Active This Month</p>
              <p class="text-2xl font-semibold text-gray-900">{{ getActiveThisMonth() }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">New This Week</p>
              <p class="text-2xl font-semibold text-gray-900">{{ getNewThisWeek() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex-1 w-full sm:max-w-md">
            <app-search-input
              placeholder="Search by name, email, or phone..."
              (search)="onSearch($event)"
            />
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500">Sort by:</span>
            <select
              (change)="onSortChange($event)"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="created-desc">Newest First</option>
              <option value="created-asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Customer List or Empty State -->
      @if (!customerState.isLoading() && customerState.customers().length === 0) {
        <div class="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No customers yet</h3>
          <p class="text-gray-500 mb-6 max-w-sm mx-auto">
            Get started by adding your first customer. Build relationships and track interactions all in one place.
          </p>
          <button
            (click)="openCreateModal()"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Add Your First Customer
          </button>
        </div>
      } @else {
        <app-customer-list
          [customers]="customerState.paginatedCustomers()"
          [isLoading]="customerState.isLoading()"
          [totalCustomers]="customerState.filteredCustomers().length"
          [currentPage]="customerState.currentPage()"
          [pageSize]="customerState.pageSize()"
          [sortColumn]="customerState.filters().sortBy"
          [sortDirection]="customerState.filters().sortOrder"
          (customerSelected)="onCustomerSelected($event)"
          (customerEdit)="openEditModal($event)"
          (customerDelete)="onDeleteCustomer($event)"
          (pageChange)="onPageChange($event)"
          (sortChange)="onSortChange($event)"
        />
      }

      <!-- Toast Notification -->
      @if (toastMessage()) {
        <div
          class="fixed bottom-4 right-4 z-50 animate-slide-up"
          [class]="toastType() === 'success' ? 'bg-green-600' : 'bg-red-600'"
        >
          <div class="flex items-center px-4 py-3 rounded-lg shadow-lg text-white">
            @if (toastType() === 'success') {
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            } @else {
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            }
            <span class="text-sm font-medium">{{ toastMessage() }}</span>
          </div>
        </div>
      }
    </div>

    <!-- Customer Modal -->
    <app-customer-modal
      [isOpen]="isModalOpen()"
      [customer]="selectedCustomer()"
      [businessId]="businessId()"
      (save)="onCreateCustomer($event)"
      (update)="onUpdateCustomer($event)"
      (cancel)="closeModal()"
    />

    <!-- Delete Confirmation Modal -->
    <app-delete-confirmation
      [isOpen]="customerState.isDeleteModalOpen()"
      [data]="deleteConfirmationData()"
      (confirm)="onConfirmDelete()"
      (cancel)="customerState.closeDeleteModal()"
    />

    <!-- Import CSV Modal -->
    <app-customer-import-modal
      [isOpen]="isImportModalOpen()"
      [businessId]="businessId()"
      (closed)="isImportModalOpen.set(false)"
      (imported)="onImportComplete($event)"
    />
  `
})
export class CustomersComponent implements OnInit, OnDestroy {
  private readonly customerService = inject(CustomerService);
  protected readonly customerState = inject(CustomerStateService);
  private readonly authService = inject(AuthService);
  private readonly businessService = inject(BusinessService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  @ViewChild(CustomerModalComponent) private customerModal?: CustomerModalComponent;

  // UI State
  protected isModalOpen = signal(false);
  protected isImportModalOpen = signal(false);
  protected selectedCustomer = signal<Customer | null>(null);
  protected businessId = signal('');
  protected customerToDelete = signal<Customer | null>(null);

  // Toast notifications
  protected toastMessage = signal('');
  protected toastType = signal<'success' | 'error'>('success');

  // Delete confirmation data
  protected deleteConfirmationData = (): DeleteConfirmationData => {
    const customer = this.customerToDelete();
    return {
      title: 'Delete Customer',
      message: customer ? `Are you sure you want to delete "${customer.name}"?` : 'Are you sure you want to delete this customer?',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    };
  };

  ngOnInit(): void {
    this.initializeBusinessId();
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.customerState.reset();
  }

  private initializeBusinessId(): void {
    const business = this.businessService.business();
    const businessId = business?.id || this.authService.user()?.businessId;
    if (businessId) {
      this.businessId.set(businessId);
    }
  }

  private loadCustomers(): void {
    const businessId = this.businessId();
    if (!businessId) return;

    this.customerState.setLoading(true);

    this.customerService.getBusinessCustomers(businessId, 50, 1)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of({ customers: [], total: 0 }))
      )
      .subscribe(response => {
        this.customerState.setCustomers(response.customers);
        this.customerState.setTotalCustomers(response.total);
        this.customerState.setLoading(false);
      });
  }

  protected onSearch(query: string): void {
    this.customerState.updateFilters({ search: query });
  }

  protected onSortChange(event: any): void {
    const value = event.target?.value || event.column + '-' + event.direction;
    const [sortBy, sortOrder] = value.split('-');
    this.customerState.updateFilters({ 
      sortBy: sortBy as 'name' | 'created' | 'updated',
      sortOrder: sortOrder as 'asc' | 'desc'
    });
  }

  protected onPageChange(page: number): void {
    this.customerState.setCurrentPage(page);
  }

  protected onCustomerSelected(customer: Customer): void {
    this.router.navigate(['/dashboard/customers', customer.id]);
  }

  protected openCreateModal(): void {
    this.selectedCustomer.set(null);
    this.isModalOpen.set(true);
  }

  protected openEditModal(customer: Customer): void {
    this.selectedCustomer.set(customer);
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedCustomer.set(null);
  }

  protected onCreateCustomer(customerData: CreateCustomerDto): void {
    this.customerService.createCustomer(customerData)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.showToast('Failed to create customer', 'error');
          this.customerModal?.resetSubmitting();
          return of(null);
        })
      )
      .subscribe(customer => {
        if (customer) {
          this.customerState.addCustomer(customer);
          this.showToast(`${customer.name} has been added`, 'success');
          this.closeModal();
        }
      });
  }

  protected onUpdateCustomer(event: { id: string; data: Partial<Customer> }): void {
    const businessId = this.businessId();
    if (!businessId) {
      this.customerModal?.resetSubmitting();
      return;
    }

    this.customerService.updateCustomer(event.id, businessId, event.data)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.showToast('Failed to update customer', 'error');
          this.customerModal?.resetSubmitting();
          return of(null);
        })
      )
      .subscribe(customer => {
        if (customer) {
          this.customerState.updateCustomer(customer);
          this.showToast(`${customer.name} has been updated`, 'success');
          this.closeModal();
        }
      });
  }

  protected onDeleteCustomer(customer: Customer): void {
    this.customerToDelete.set(customer);
    this.customerState.openDeleteModal(customer);
  }

  protected onConfirmDelete(): void {
    const customer = this.customerToDelete();
    const businessId = this.businessId();

    if (!customer || !businessId) {
      this.customerState.closeDeleteModal();
      return;
    }

    this.customerService.deleteCustomer(customer.id, businessId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          // Check if it's a conflict error (customer has invoices/orders)
          if (error.status === 409 || error.error?.statusCode === 409) {
            const message = error.error?.message || 'Cannot delete customer with existing invoices or orders';
            this.showToast(message, 'error');
          } else {
            this.showToast('Failed to delete customer', 'error');
          }
          return of(null);
        })
      )
      .subscribe({
        next: () => {
          // Success - remove customer from UI state
          this.customerState.removeCustomer(customer.id);
          this.showToast(`${customer.name} has been deleted`, 'success');
          this.customerState.closeDeleteModal();
          this.customerToDelete.set(null);
        },
        error: (error) => {
          // Error handling
          if (error.status === 409 || error.error?.statusCode === 409) {
            const message = error.error?.message || 'Cannot delete customer with existing invoices or orders';
            this.showToast(message, 'error');
          } else {
            this.showToast('Failed to delete customer', 'error');
          }
          this.customerState.closeDeleteModal();
          this.customerToDelete.set(null);
        }
      });
  }

  protected onImportComplete(count: number): void {
    this.isImportModalOpen.set(false);
    this.showToast(`Successfully imported ${count} customers`, 'success');
    this.loadCustomers();
  }

  // Stats helper methods
  protected getActiveThisMonth(): number {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.customerState.customers().filter(c => {
      const updatedAt = new Date(c.updatedAt);
      return updatedAt >= startOfMonth;
    }).length;
  }

  protected getNewThisWeek(): number {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return this.customerState.customers().filter(c => {
      const createdAt = new Date(c.createdAt);
      return createdAt >= startOfWeek;
    }).length;
  }

  // Toast notification helper
  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }
}