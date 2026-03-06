import { Component, Input, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TopPerformers } from '../../../../shared/models/dashboard.model';

@Component({
  selector: 'app-top-performers',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './top-performers.component.html',
})
export class TopPerformersComponent {
  @Input({ required: true }) performers!: TopPerformers;

  protected activeTab = signal<'products' | 'customers'>('products');

  setTab(tab: 'products' | 'customers'): void {
    this.activeTab.set(tab);
  }
}
