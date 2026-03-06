import { Component, Input, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FinancialSummary } from '../../../../shared/models/dashboard.model';

@Component({
  selector: 'app-financial-cards',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './financial-cards.component.html',
})
export class FinancialCardsComponent {
  @Input({ required: true }) financial!: FinancialSummary;

  protected taxExpanded = signal(false);

  toggleTaxBreakdown(): void {
    this.taxExpanded.update((v) => !v);
  }
}
