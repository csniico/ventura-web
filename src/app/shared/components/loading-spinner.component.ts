import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [class]="containerClass">
      <div 
        class="animate-spin rounded-full border-2 border-gray-300 border-t-primary"
        [class]="spinnerClass"
        [style.width.px]="size"
        [style.height.px]="size">
      </div>
      @if (text) {
        <span class="ml-3 text-gray-600" [class]="textClass">{{ text }}</span>
      }
    </div>
  `
})
export class LoadingSpinnerComponent {
  @Input() size: number = 24;
  @Input() text: string = '';
  @Input() containerClass: string = '';
  @Input() spinnerClass: string = '';
  @Input() textClass: string = '';
}