import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-pulse">
      <!-- Header skeleton -->
      <div class="flex items-center justify-between">
        <div>
          <div class="h-7 bg-gray-200 rounded w-48 mb-2"></div>
          <div class="h-4 bg-gray-100 rounded w-64"></div>
        </div>
        <div class="h-10 bg-gray-200 rounded-lg w-32"></div>
      </div>

      @if (showStats) {
        <!-- Stats cards skeleton -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div class="ml-3">
                  <div class="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                  <div class="h-6 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Table skeleton -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div class="flex gap-4">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="h-4 bg-gray-200 rounded w-20"></div>
            }
          </div>
        </div>
        @for (i of rows; track i) {
          <div class="px-6 py-4 border-b border-gray-100">
            <div class="flex items-center gap-4">
              @if (showAvatar) {
                <div class="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0"></div>
              }
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 rounded w-1/3"></div>
                <div class="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
              <div class="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class PageSkeletonComponent {
  @Input() showStats = true;
  @Input() showAvatar = false;
  @Input() rowCount = 5;

  get rows(): number[] {
    return Array.from({ length: this.rowCount }, (_, i) => i + 1);
  }
}
