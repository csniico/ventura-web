import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil, catchError, of, forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { BusinessService } from '../../../../core/services/business.service';
import { CustomerService } from '../../../../core/services/customer.service';
import { OrderService } from '../../../../core/services/order.service';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { Customer } from '../../../../shared/models/customer.model';
import { Order } from '../../../../core/models/order.model';
import { Invoice } from '../../../../core/models/invoice.model';

type DetailTab = 'orders' | 'invoices' | 'info';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './customer-detail.component.html',
})
export class CustomerDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly businessService = inject(BusinessService);
  private readonly customerService = inject(CustomerService);
  private readonly orderService = inject(OrderService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly destroy$ = new Subject<void>();

  protected isLoading = signal(true);
  protected customer = signal<Customer | null>(null);
  protected orders = signal<Order[]>([]);
  protected invoices = signal<Invoice[]>([]);
  protected activeTab = signal<DetailTab>('orders');

  protected totalSpent = computed(() => {
    return this.invoices()
      .filter((i) => i.status === 'PAID' || i.status === 'PARTIALLY_PAID')
      .reduce((sum, i) => sum + i.amountPaid, 0);
  });

  protected orderCount = computed(() => this.orders().length);
  protected invoiceCount = computed(() => this.invoices().length);

  ngOnInit(): void {
    const customerId = this.route.snapshot.paramMap.get('id');
    const businessId =
      this.businessService.business()?.id || this.authService.user()?.businessId;

    if (customerId && businessId) {
      this.loadCustomerData(customerId, businessId);
    } else {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCustomerData(customerId: string, businessId: string): void {
    forkJoin({
      customer: this.customerService.getCustomerById(customerId, businessId).pipe(
        catchError(() => of(null))
      ),
      orders: this.orderService
        .getCustomerOrders(customerId, businessId)
        .pipe(catchError(() => of({ orders: [], total: 0, page: 1, limit: 20, totalPages: 1 }))),
      invoices: this.invoiceService
        .getCustomerInvoices(customerId, businessId)
        .pipe(catchError(() => of({ invoices: [], total: 0, page: 1, limit: 20, totalPages: 1 }))),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.customer.set(data.customer);
          this.orders.set(data.orders.orders || []);
          this.invoices.set(data.invoices.invoices || []);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  protected setTab(tab: DetailTab): void {
    this.activeTab.set(tab);
  }

  protected getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-800',
      COMPLETED: 'bg-emerald-100 text-emerald-800',
      CANCELLED: 'bg-red-100 text-red-800',
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      PAID: 'bg-emerald-100 text-emerald-800',
      PARTIALLY_PAID: 'bg-amber-100 text-amber-800',
      OVERDUE: 'bg-red-100 text-red-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}
