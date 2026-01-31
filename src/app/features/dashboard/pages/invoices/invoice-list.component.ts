import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invoice, InvoiceStatus } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-list.component.html'
})
export class InvoiceListComponent {
  @Input() invoices: Invoice[] = [];
  @Input() isLoading = false;
  @Input() totalInvoices = 0;
  @Input() currentPage = 1;
  @Input() pageSize = 10;

  @Output() invoiceView = new EventEmitter<Invoice>();
  @Output() invoicePayment = new EventEmitter<Invoice>();
  @Output() invoiceStatusChange = new EventEmitter<Invoice>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() createInvoice = new EventEmitter<void>();

  protected Math = Math;
  protected InvoiceStatus = InvoiceStatus;

  protected getStatusClasses(status: InvoiceStatus): string {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return 'bg-gray-50 text-gray-700';
      case InvoiceStatus.SENT:
        return 'bg-blue-50 text-blue-700';
      case InvoiceStatus.PAID:
        return 'bg-green-50 text-green-700';
      case InvoiceStatus.PARTIALLY_PAID:
        return 'bg-amber-50 text-amber-700';
      case InvoiceStatus.OVERDUE:
        return 'bg-red-50 text-red-700';
      case InvoiceStatus.CANCELLED:
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  }

  protected getStatusLabel(status: InvoiceStatus): string {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return 'Draft';
      case InvoiceStatus.SENT:
        return 'Sent';
      case InvoiceStatus.PAID:
        return 'Paid';
      case InvoiceStatus.PARTIALLY_PAID:
        return 'Partial';
      case InvoiceStatus.OVERDUE:
        return 'Overdue';
      case InvoiceStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  }

  protected canRecordPayment(invoice: Invoice): boolean {
    return invoice.status === InvoiceStatus.SENT ||
           invoice.status === InvoiceStatus.OVERDUE ||
           invoice.status === InvoiceStatus.PARTIALLY_PAID;
  }

  protected canUpdateStatus(invoice: Invoice): boolean {
    return invoice.status !== InvoiceStatus.PAID &&
           invoice.status !== InvoiceStatus.CANCELLED;
  }

  protected isOverdue(invoice: Invoice): boolean {
    if (!invoice.dueDate) return false;
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && invoice.status !== InvoiceStatus.PAID && invoice.status !== InvoiceStatus.CANCELLED;
  }

  protected onPageChange(page: number): void {
    this.pageChange.emit(page);
  }
}
