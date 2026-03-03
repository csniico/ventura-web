import { Component, Input, Output, EventEmitter, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Invoice, CreateInvoiceDto, InvoiceType, InvoiceStatus } from '../../../../core/models/invoice.model';
import { Customer } from '../../../../core/models/customer.model';
import { Order, OrderStatus } from '../../../../core/models/order.model';

@Component({
  selector: 'app-invoice-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-modal.component.html'
})
export class InvoiceModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() invoice: Invoice | null = null;
  @Input() customers: Customer[] = [];
  @Input() availableOrders: Order[] = [];
  @Input() businessId = '';
  @Input() viewMode = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateInvoiceDto>();

  protected selectedCustomerId = signal('');
  protected selectedOrderIds = signal<string[]>([]);
  protected dueDate = signal('');
  protected notes = signal('');
  protected invoiceType = signal<InvoiceType>(InvoiceType.STANDARD);
  protected isSubmitting = signal(false);

  protected readonly InvoiceType = InvoiceType;
  protected readonly InvoiceStatus = InvoiceStatus;

  protected customerOrders = computed(() => {
    const customerId = this.selectedCustomerId();
    if (!customerId) return [];
    
    // Only show COMPLETED orders that don't already have invoices
    return this.availableOrders.filter(o => 
      o.customerId === customerId && 
      o.status === OrderStatus.COMPLETED && 
      !o.invoiceId
    );
  });

  protected selectedOrders = computed(() => {
    const orderIds = this.selectedOrderIds();
    return this.availableOrders.filter(o => orderIds.includes(o.id));
  });

  protected subtotal = computed(() => {
    return this.selectedOrders().reduce((sum, o) => sum + o.totalAmount, 0);
  });

  protected vatAmount = computed(() => this.subtotal() * 0.15);
  protected nhilAmount = computed(() => this.subtotal() * 0.025);
  protected getfundAmount = computed(() => this.subtotal() * 0.025);
  protected totalTax = computed(() => this.vatAmount() + this.nhilAmount() + this.getfundAmount());
  protected totalAmount = computed(() => this.subtotal() + this.totalTax());

  protected isValid = computed(() => {
    const hasCustomer = this.selectedCustomerId() !== '';
    const hasCompletedOrders = this.selectedOrderIds().length > 0;
    const hasDueDate = this.dueDate() !== '';
    
    // Additional validation: ensure selected orders are all completed
    const selectedOrders = this.selectedOrders();
    const allOrdersCompleted = selectedOrders.every(order => 
      order.status === OrderStatus.COMPLETED && !order.invoiceId
    );
    
    return hasCustomer && hasCompletedOrders && hasDueDate && allOrdersCompleted;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && !this.viewMode) {
      this.resetForm();
    }
  }

  protected resetForm(): void {
    this.selectedCustomerId.set('');
    this.selectedOrderIds.set([]);
    this.dueDate.set(this.getDefaultDueDate());
    this.notes.set('');
    this.invoiceType.set(InvoiceType.STANDARD);
    this.isSubmitting.set(false);
  }

  protected getDefaultDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  }

  protected onCustomerChange(customerId: string): void {
    this.selectedCustomerId.set(customerId);
    this.selectedOrderIds.set([]);
  }

  protected toggleOrder(orderId: string): void {
    const current = this.selectedOrderIds();
    if (current.includes(orderId)) {
      this.selectedOrderIds.set(current.filter(id => id !== orderId));
    } else {
      this.selectedOrderIds.set([...current, orderId]);
    }
  }

  protected selectAllOrders(): void {
    const customerOrders = this.customerOrders();
    this.selectedOrderIds.set(customerOrders.map(o => o.id));
  }

  protected deselectAllOrders(): void {
    this.selectedOrderIds.set([]);
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.isSubmitting()) return;

    // Double-check that all selected orders are completed and don't have invoices
    const selectedOrders = this.selectedOrders();
    const invalidOrders = selectedOrders.filter(order => 
      order.status !== OrderStatus.COMPLETED || order.invoiceId
    );
    
    if (invalidOrders.length > 0) {
      console.error('Cannot create invoice: Some orders are not completed or already have invoices');
      return;
    }

    this.isSubmitting.set(true);

    const dto: CreateInvoiceDto = {
      businessId: this.businessId,
      customerId: this.selectedCustomerId(),
      orderIds: this.selectedOrderIds(),
      dueDate: this.dueDate(),
      invoiceType: this.invoiceType(),
      notes: this.notes() || undefined
    };

    this.save.emit(dto);
  }

  protected onClose(): void {
    this.close.emit();
  }

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
}
