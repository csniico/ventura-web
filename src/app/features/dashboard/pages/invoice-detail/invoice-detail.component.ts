import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { BusinessService } from '../../../../core/services/business.service';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { InvoicePdfService } from '../../../../core/services/invoice-pdf.service';
import { Invoice, InvoiceStatus } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './invoice-detail.component.html',
})
export class InvoiceDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly businessService = inject(BusinessService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly invoicePdfService = inject(InvoicePdfService);
  private readonly destroy$ = new Subject<void>();

  protected isLoading = signal(true);
  protected invoice = signal<Invoice | null>(null);

  protected balanceDue = computed(() => {
    const inv = this.invoice();
    if (!inv) return 0;
    return inv.totalAmount - inv.amountPaid;
  });

  protected paymentProgress = computed(() => {
    const inv = this.invoice();
    if (!inv || inv.totalAmount === 0) return 0;
    return Math.round((inv.amountPaid / inv.totalAmount) * 100);
  });

  protected isOverdue = computed(() => {
    const inv = this.invoice();
    if (!inv?.dueDate) return false;
    return new Date(inv.dueDate) < new Date() &&
      inv.status !== InvoiceStatus.PAID &&
      inv.status !== InvoiceStatus.CANCELLED;
  });

  ngOnInit(): void {
    const invoiceId = this.route.snapshot.paramMap.get('id');
    const businessId = this.businessService.getCurrentBusiness()?.id ||
      this.businessService.business()?.id ||
      this.authService.user()?.businessId;

    if (invoiceId && businessId) {
      this.loadInvoice(invoiceId, businessId);
    } else {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInvoice(invoiceId: string, businessId: string): void {
    this.invoiceService.getInvoiceById(invoiceId, businessId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of(null))
      )
      .subscribe(invoice => {
        this.invoice.set(invoice);
        this.isLoading.set(false);
      });
  }

  protected onPrint(): void {
    const inv = this.invoice();
    const business = this.businessService.getCurrentBusiness() || this.businessService.business();
    if (inv && business) {
      this.invoicePdfService.generatePdf(inv, business);
    }
  }

  protected getStatusClasses(status: string): string {
    const classes: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      PAID: 'bg-emerald-100 text-emerald-800',
      PARTIALLY_PAID: 'bg-amber-100 text-amber-800',
      OVERDUE: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  protected getStatusLabel(status: string): string {
    return status.replace('_', ' ');
  }
}
