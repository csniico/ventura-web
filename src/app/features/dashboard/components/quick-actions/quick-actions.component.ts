import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

export type QuickActionType = 'appointment' | 'customer' | 'product' | 'order' | 'invoice';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quick-actions.component.html'
})
export class QuickActionsComponent {
  private readonly router = inject(Router);

  @Output() actionClicked = new EventEmitter<QuickActionType>();

  protected onAction(action: QuickActionType): void {
    this.actionClicked.emit(action);

    switch (action) {
      case 'customer':
        this.router.navigate(['/dashboard/customers'], { queryParams: { action: 'create' } });
        break;
      case 'order':
        this.router.navigate(['/dashboard/orders'], { queryParams: { action: 'create' } });
        break;
      case 'invoice':
        this.router.navigate(['/dashboard/invoices'], { queryParams: { action: 'create' } });
        break;
      case 'product':
        this.router.navigate(['/dashboard/products'], { queryParams: { action: 'create' } });
        break;
    }
  }
}
