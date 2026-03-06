import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { BusinessService } from '../../../../core/services/business.service';
import { OrderService } from '../../../../core/services/order.service';
import { Order, OrderStatus } from '../../../../core/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly businessService = inject(BusinessService);
  private readonly orderService = inject(OrderService);
  private readonly destroy$ = new Subject<void>();

  protected isLoading = signal(true);
  protected order = signal<Order | null>(null);
  private businessId = '';

  protected itemCount = computed(() => {
    const ord = this.order();
    return ord?.items?.length || 0;
  });

  protected productCount = computed(() => {
    return this.order()?.items?.filter(i => i.itemType === 'product').length || 0;
  });

  protected serviceCount = computed(() => {
    return this.order()?.items?.filter(i => i.itemType === 'service').length || 0;
  });

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    this.businessId = this.businessService.getCurrentBusiness()?.id ||
      this.businessService.business()?.id ||
      this.authService.user()?.businessId || '';

    if (orderId && this.businessId) {
      this.loadOrder(orderId, this.businessId);
    } else {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrder(orderId: string, businessId: string): void {
    this.orderService.getOrderById(orderId, businessId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of(null))
      )
      .subscribe(order => {
        this.order.set(order);
        this.isLoading.set(false);
      });
  }

  protected onUpdateStatus(status: OrderStatus): void {
    const ord = this.order();
    if (!ord) return;

    this.orderService.updateOrderStatus(ord.id, this.businessId, { status })
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of(null))
      )
      .subscribe(updated => {
        if (updated) {
          this.order.set(updated);
        }
      });
  }

  protected getStatusClasses(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  protected canComplete(order: Order): boolean {
    return order.status === OrderStatus.PENDING;
  }

  protected canCancel(order: Order): boolean {
    return order.status === OrderStatus.PENDING;
  }

  protected readonly OrderStatus = OrderStatus;
}
