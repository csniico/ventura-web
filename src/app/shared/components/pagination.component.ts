import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <div class="flex justify-between flex-1 sm:hidden">
        <button
          (click)="onPrevious()"
          [disabled]="currentPage <= 1"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          (click)="onNext()"
          [disabled]="currentPage >= totalPages()"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <p class="text-sm text-gray-700">
          Showing {{ startItem() }} to {{ endItem() }} of {{ totalItems }} results
        </p>
        
        <nav class="inline-flex -space-x-px rounded-md shadow-sm">
          <button
            (click)="onPrevious()"
            [disabled]="currentPage <= 1"
            class="px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50"
          >
            ←
          </button>

          @for (page of visiblePages(); track page) {
            <button
              (click)="onPageClick(page)"
              [class]="getPageButtonClass(page)"
            >
              {{ page }}
            </button>
          }

          <button
            (click)="onNext()"
            [disabled]="currentPage >= totalPages()"
            class="px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50"
          >
            →
          </button>
        </nav>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalItems = 0;
  @Input() itemsPerPage = 25;

  @Output() pageChange = new EventEmitter<number>();

  protected totalPages = computed(() => Math.ceil(this.totalItems / this.itemsPerPage));
  
  protected startItem = computed(() => {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  });
  
  protected endItem = computed(() => {
    const end = this.currentPage * this.itemsPerPage;
    return Math.min(end, this.totalItems);
  });

  protected visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage;
    const max = 7;
    
    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(max / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + max - 1);

    if (end - start + 1 < max) {
      start = Math.max(1, end - max + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  protected onPageClick(page: number): void {
    if (page !== this.currentPage && page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }

  protected onPrevious(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  protected onNext(): void {
    if (this.currentPage < this.totalPages()) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  protected getPageButtonClass(page: number): string {
    const baseClass = 'px-4 py-2 text-sm font-medium border';
    
    if (page === this.currentPage) {
      return `${baseClass} z-10 bg-blue-50 border-blue-500 text-blue-600`;
    }
    
    return `${baseClass} bg-white border-gray-300 text-gray-500 hover:bg-gray-50`;
  }
}