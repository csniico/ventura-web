import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, OrderStatus } from '../../../../core/models/order.model';

@Component({
  selector: 'app-order-status-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-status-modal.component.html'
})
export class OrderStatusModalComponent {
  @Input() isOpen = false;
  @Input() order!: Order;

  @Output() save = new EventEmitter<{ orderId: string; status: OrderStatus }>();
  @Output() close = new EventEmitter<void>();

  protected readonly selectedStatus = signal<OrderStatus | null>(null);

  protected readonly availableStatuses = [
    {
      value: OrderStatus.PENDING,
      label: 'Pending',
      description: 'Order is awaiting processing'
    },
    {
      value: OrderStatus.COMPLETED,
      label: 'Completed',
      description: 'Order has been fulfilled'
    },
    {
      value: OrderStatus.CANCELLED,
      label: 'Cancelled',
      description: 'Order has been cancelled'
    }
  ];

  /**
   * Legal transitions, mirroring the backend: CANCELLED is terminal, a COMPLETED
   * order can only be cancelled (never reopened), and an order that is already on
   * an invoice can't be cancelled — the invoice must be cancelled first. This
   * stops paid/invoiced orders being cancelled out from under their invoice.
   */
  private static readonly TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
    [OrderStatus.COMPLETED]: [OrderStatus.CANCELLED],
    [OrderStatus.CANCELLED]: []
  };

  ngOnChanges(): void {
    if (this.isOpen && this.order) {
      this.selectedStatus.set(this.order.status);
    }
  }

  /** The current status is always shown (as the active one); others must be a
   *  legal transition and not blocked by an existing invoice. */
  protected isStatusDisabled(status: OrderStatus): boolean {
    if (!this.order) return true;
    if (status === this.order.status) return false;
    const allowed = OrderStatusModalComponent.TRANSITIONS[this.order.status] ?? [];
    if (!allowed.includes(status)) return true;
    if (status === OrderStatus.CANCELLED && !!this.order.invoiceId) return true;
    return false;
  }

  protected disabledReason(status: OrderStatus): string | null {
    if (!this.order || !this.isStatusDisabled(status) || status === this.order.status) {
      return null;
    }
    if (status === OrderStatus.CANCELLED && !!this.order.invoiceId) {
      return 'On an invoice — cancel the invoice first';
    }
    return 'Not allowed from the current status';
  }

  protected getStatusDotColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-amber-500';
      case OrderStatus.COMPLETED:
        return 'bg-green-500';
      case OrderStatus.CANCELLED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  protected selectStatus(status: OrderStatus): void {
    if (this.isStatusDisabled(status)) return;
    this.selectedStatus.set(status);
  }

  protected onConfirm(): void {
    const status = this.selectedStatus();
    if (status && status !== this.order.status) {
      this.save.emit({ orderId: this.order.id, status });
    }
  }

  protected onCancel(): void {
    this.close.emit();
  }
}
