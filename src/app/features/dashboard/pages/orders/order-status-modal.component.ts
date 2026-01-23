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

  ngOnChanges(): void {
    if (this.isOpen && this.order) {
      this.selectedStatus.set(this.order.status);
    }
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
