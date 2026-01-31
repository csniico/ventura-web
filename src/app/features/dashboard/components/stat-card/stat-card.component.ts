import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type IconType = 'calendar' | 'users' | 'clock' | 'package' | 'chart' | 'default';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html'
})
export class StatCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: number | string;
  @Input() subtitle?: string;
  @Input() iconType: IconType = 'default';
  @Input() iconColorClass: string = 'text-blue-600';
  @Input() iconBgClass: string = 'bg-blue-50';

  protected get displayValue(): string {
    if (typeof this.value === 'number') {
      return this.value.toLocaleString();
    }
    return this.value;
  }
}
