import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export type QuickActionType = 'appointment' | 'customer' | 'product' | 'service';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quick-actions.component.html'
})
export class QuickActionsComponent {
  @Output() actionClicked = new EventEmitter<QuickActionType>();

  protected onAction(action: QuickActionType): void {
    this.actionClicked.emit(action);
    // TODO: Open modal or navigate to create page
    console.log('Quick action clicked:', action);
  }
}
