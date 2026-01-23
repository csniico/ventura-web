import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, OrderStatus } from '../../../../core/models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-list.component.html'
})
export class OrderListComponent {
  @Input() orders: Order[] = [];
  @Input() isLoading = false;
  @Input() totalOrders = 0;
  @Input() currentPage = 1;
  @Input() pageSize = 10;

  @Output() orderView = new EventEmitter<Order>();
  @Output() orderStatusChange = new EventEmitter<Order>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() createOrder = new EventEmitter<void>();

  protected Math = Math;

  protected getStatusClasses(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-amber-50 text-amber-700';
      case OrderStatus.COMPLETED:
        return 'bg-green-50 text-green-700';
      case OrderStatus.CANCELLED:
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  }

  protected getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pending';
      case OrderStatus.COMPLETED:
        return 'Completed';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  }

  protected onPageChange(page: number): void {
    this.pageChange.emit(page);
  }
}
