import { Component, Input, Output, EventEmitter, TemplateRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-hidden bg-white border border-gray-200 rounded-lg">
      @if (title || showSearch) {
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            @if (title) {
              <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
            }
            @if (showSearch) {
              <div class="flex items-center space-x-2">
                <ng-content select="[slot=actions]"></ng-content>
              </div>
            }
          </div>
        </div>
      }

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              @for (column of columns; track column.key) {
                <th
                  [style.width]="column.width"
                  [class]="getHeaderClass(column)"
                  (click)="onSort(column)"
                >
                  <div class="flex items-center space-x-1">
                    <span>{{ column.label }}</span>
                    @if (column.sortable) {
                      <div class="flex flex-col">
                        <svg 
                          class="w-3 h-3 text-gray-400"
                          [class.text-blue-600]="sortColumn === column.key && sortDirection === 'asc'"
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"/>
                        </svg>
                        <svg 
                          class="w-3 h-3 text-gray-400 -mt-1"
                          [class.text-blue-600]="sortColumn === column.key && sortDirection === 'desc'"
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                      </div>
                    }
                  </div>
                </th>
              }
              @if (showActions) {
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              }
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @if (isLoading) {
              <tr>
                <td [attr.colspan]="columns.length + (showActions ? 1 : 0)" class="px-6 py-12 text-center">
                  <div class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span class="ml-2 text-gray-500">Loading...</span>
                  </div>
                </td>
              </tr>
            } @else if (data.length === 0) {
              <tr>
                <td [attr.colspan]="columns.length + (showActions ? 1 : 0)" class="px-6 py-12 text-center text-gray-500">
                  {{ emptyMessage }}
                </td>
              </tr>
            } @else {
              @for (item of data; track trackByFn ? trackByFn($index, item) : $index) {
                <tr class="hover:bg-blue-50/50 cursor-pointer transition-colors duration-150" (click)="onRowClick(item)">
                  @for (column of columns; track column.key) {
                    <td [class]="getCellClass(column)" [style.width]="column.width">
                      <ng-container [ngTemplateOutlet]="cellTemplate" 
                                    [ngTemplateOutletContext]="{ $implicit: item, column: column, value: getColumnValue(item, column.key) }">
                      </ng-container>
                    </td>
                  }
                  @if (showActions) {
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ng-container [ngTemplateOutlet]="rowActionsTemplate" 
                                    [ngTemplateOutletContext]="{ $implicit: item }">
                      </ng-container>
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DataTableComponent<T = any> {
  @Input() data: T[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() isLoading = false;
  @Input() title?: string;
  @Input() emptyMessage = 'No data available';
  @Input() showActions = false;
  @Input() showSearch = false;
  @Input() sortColumn?: string;
  @Input() sortDirection: 'asc' | 'desc' = 'asc';
  @Input() trackByFn?: (index: number, item: T) => any;

  @Output() rowClick = new EventEmitter<T>();
  @Output() sort = new EventEmitter<SortEvent>();

  @ContentChild('cellTemplate') cellTemplate!: TemplateRef<any>;
  @ContentChild('rowActionsTemplate') rowActionsTemplate!: TemplateRef<any>;

  protected onRowClick(item: T): void {
    this.rowClick.emit(item);
  }

  protected onSort(column: TableColumn): void {
    if (!column.sortable) return;

    let direction: 'asc' | 'desc' = 'asc';
    
    if (this.sortColumn === column.key) {
      direction = this.sortDirection === 'asc' ? 'desc' : 'asc';
    }

    this.sort.emit({ column: column.key, direction });
  }

  protected getHeaderClass(column: TableColumn): string {
    const baseClass = 'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider';
    const alignClass = this.getAlignClass(column.align);
    const sortableClass = column.sortable ? 'cursor-pointer hover:bg-gray-100' : '';
    
    return `${baseClass} ${alignClass} ${sortableClass}`;
  }

  protected getCellClass(column: TableColumn): string {
    const baseClass = 'px-6 py-4 whitespace-nowrap text-sm';
    const alignClass = this.getAlignClass(column.align);
    
    return `${baseClass} ${alignClass}`;
  }

  private getAlignClass(align?: string): string {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  }

  protected getColumnValue(item: any, key: string): any {
    return key.split('.').reduce((obj, prop) => obj?.[prop], item);
  }
}