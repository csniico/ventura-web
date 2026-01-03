import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [class]="containerClass">
      <div 
        class="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
        [class]="spinnerClass"
        [attr.aria-label]="ariaLabel">
      </div>
      <span *ngIf="text" class="ml-2 text-sm text-gray-600">{{ text }}</span>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() text?: string;
  @Input() containerClass = '';
  @Input() ariaLabel = 'Loading';

  get spinnerClass(): string {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6', 
      lg: 'h-8 w-8'
    };
    return sizes[this.size];
  }
}