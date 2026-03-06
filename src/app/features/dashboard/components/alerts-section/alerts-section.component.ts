import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardAlerts } from '../../../../shared/models/dashboard.model';

@Component({
  selector: 'app-alerts-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './alerts-section.component.html',
})
export class AlertsSectionComponent {
  @Input({ required: true }) alerts!: DashboardAlerts;

  get hasAlerts(): boolean {
    return (
      this.alerts.pendingOrders.count > 0 ||
      this.alerts.outOfStockProducts.count > 0 ||
      this.alerts.overdueInvoices.count > 0
    );
  }
}
