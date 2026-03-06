import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RecentActivity, ActivityType } from '../../../../shared/models/dashboard.model';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './activity-feed.component.html',
})
export class ActivityFeedComponent {
  @Input({ required: true }) activities!: RecentActivity[];

  getActivityIcon(type: ActivityType): { bg: string; color: string } {
    const map: Record<ActivityType, { bg: string; color: string }> = {
      order_completed: { bg: 'bg-emerald-100', color: 'text-emerald-600' },
      order_cancelled: { bg: 'bg-red-100', color: 'text-red-600' },
      invoice_paid: { bg: 'bg-emerald-100', color: 'text-emerald-600' },
      invoice_created: { bg: 'bg-blue-100', color: 'text-blue-600' },
      invoice_overdue: { bg: 'bg-amber-100', color: 'text-amber-600' },
      invoice_cancelled: { bg: 'bg-red-100', color: 'text-red-600' },
      product_out_of_stock: { bg: 'bg-red-100', color: 'text-red-600' },
      product_low_stock: { bg: 'bg-amber-100', color: 'text-amber-600' },
      new_customer: { bg: 'bg-blue-100', color: 'text-blue-600' },
      new_order: { bg: 'bg-violet-100', color: 'text-violet-600' },
    };
    return map[type] || { bg: 'bg-gray-100', color: 'text-gray-600' };
  }
}
