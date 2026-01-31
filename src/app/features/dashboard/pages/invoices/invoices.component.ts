import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin, takeUntil, catchError, of } from 'rxjs';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { InvoiceStateService, InvoiceTab } from '../../services/invoice-state.service';
import { CustomerService } from '../../../../core/services/customer.service';
import { OrderService } from '../../../../core/services/order.service';
import { BusinessService } from '../../../../core/services/business.service';
import { Invoice, CreateInvoiceDto, InvoiceStatus, UpdateInvoicePaymentDto, PaymentMethod } from '../../../../core/models/invoice.model';
import { OrderStatus } from '../../../../core/models/order.model';
import { SearchInputComponent } from '../../../../shared/components/search-input.component';
import { InvoiceListComponent } from './invoice-list.component';
import { InvoiceModalComponent } from './invoice-modal.component';
import { InvoicePaymentModalComponent } from './invoice-payment-modal.component';
import { InvoiceStatusModalComponent } from './invoice-status-modal.component';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    SearchInputComponent,
    InvoiceListComponent,
    InvoiceModalComponent,
    InvoicePaymentModalComponent,
    InvoiceStatusModalComponent
  ],
  templateUrl: './invoices.component.html'
})
export class InvoicesComponent implements OnInit, OnDestroy {
  protected readonly invoiceState = inject(InvoiceStateService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly customerService = inject(CustomerService);
  private readonly orderService = inject(OrderService);
  private readonly businessService = inject(BusinessService);
  private readonly destroy$ = new Subject<void>();

  protected readonly businessId = signal('');
  protected readonly toastMessage = signal('');
  protected readonly toastType = signal<'success' | 'error'>('success');

  protected readonly tabs: { key: InvoiceTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'draft', label: 'Draft' },
    { key: 'sent', label: 'Sent' },
    { key: 'paid', label: 'Paid' },
    { key: 'overdue', label: 'Overdue' }
  ];

  ngOnInit(): void {
    this.loadBusinessAndInvoices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBusinessAndInvoices(): void {
    this.invoiceState.setInvoicesLoading(true);

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
      invoices: this.invoiceService.getInvoices(businessId).pipe(
        catchError(() => of({ invoices: [], total: 0, page: 1, limit: 20, totalPages: 1 }))
      ),
      customers: this.customerService.getCustomers(businessId).pipe(catchError(() => of([]))),
      orders: this.orderService.getOrders(businessId, OrderStatus.COMPLETED).pipe(
        catchError(() => of({ orders: [], total: 0, page: 1, limit: 100, totalPages: 1 }))
      )
    }).pipe(takeUntil(this.destroy$))
      .subscribe(({ invoices, customers, orders }) => {
        this.invoiceState.setInvoices(invoices.invoices);
        this.invoiceState.setPagination(invoices.total, invoices.totalPages);
        this.invoiceState.setCustomers(customers);
        // Filter orders that don't have invoices yet
        const availableOrders = orders.orders.filter(o => !o.invoiceId);
        this.invoiceState.setAvailableOrders(availableOrders);
        this.invoiceState.setInvoicesLoading(false);
      });
  }

  protected getTabCount(tab: InvoiceTab): number {
    return this.invoiceState.invoiceCounts()[tab];
  }

  protected onTabChange(tab: InvoiceTab): void {
    this.invoiceState.setActiveTab(tab);
  }

  protected onSearch(query: string): void {
    this.invoiceState.setSearchQuery(query);
  }

  protected onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const [sortBy, sortOrder] = value.split('-') as ['createdAt' | 'totalAmount' | 'invoiceNumber' | 'dueDate', 'asc' | 'desc'];
    this.invoiceState.setSorting(sortBy, sortOrder);
  }

  protected onPageChange(page: number): void {
    this.invoiceState.setCurrentPage(page);
  }

  protected openCreateModal(): void {
    this.invoiceState.openCreateModal();
  }

  protected onViewInvoice(invoice: Invoice): void {
    this.invoiceState.openViewModal(invoice);
  }

  protected onRecordPayment(invoice: Invoice): void {
    this.invoiceState.openPaymentModal(invoice);
  }

  protected onUpdateStatus(invoice: Invoice): void {
    this.invoiceState.openStatusModal(invoice);
  }

  protected onSaveInvoice(dto: CreateInvoiceDto): void {
    this.invoiceService.createInvoice(dto)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.showToast('Failed to create invoice', 'error');
          return of(null);
        })
      )
      .subscribe(invoice => {
        if (invoice) {
          this.invoiceState.addInvoice(invoice);
          this.invoiceState.closeModal();
          this.showToast(`Invoice ${invoice.invoiceNumber} created successfully`, 'success');
          // Refresh available orders
          this.loadAvailableOrders();
        }
      });
  }

  protected onSavePayment(data: { invoiceId: string; dto: UpdateInvoicePaymentDto }): void {
    this.invoiceService.updateInvoicePayment(data.invoiceId, this.businessId(), data.dto)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.showToast('Failed to record payment', 'error');
          return of(null);
        })
      )
      .subscribe(invoice => {
        if (invoice) {
          this.invoiceState.updateInvoice(invoice);
          this.invoiceState.closePaymentModal();
          this.showToast('Payment recorded successfully', 'success');
        }
      });
  }

  protected onSaveStatus(data: { invoiceId: string; status: InvoiceStatus }): void {
    this.invoiceService.updateInvoiceStatus(data.invoiceId, this.businessId(), { status: data.status })
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.showToast('Failed to update invoice status', 'error');
          return of(null);
        })
      )
      .subscribe(invoice => {
        if (invoice) {
          this.invoiceState.updateInvoice(invoice);
          this.invoiceState.closeStatusModal();
          this.showToast(`Invoice status updated to ${data.status}`, 'success');
        }
      });
  }

  private loadAvailableOrders(): void {
    this.orderService.getOrders(this.businessId(), OrderStatus.COMPLETED)
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        const availableOrders = response.orders.filter(o => !o.invoiceId);
        this.invoiceState.setAvailableOrders(availableOrders);
      });
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }
}
