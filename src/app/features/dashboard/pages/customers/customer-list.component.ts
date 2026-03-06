import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customer } from '../../../../shared/models/customer.model';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table.component';
import { PaginationComponent } from '../../../../shared/components/pagination.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent, PaginationComponent],
  template: `
    <!-- Loading Skeleton -->
    @if (isLoading) {
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="animate-pulse">
          <!-- Header skeleton -->
          <div class="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div class="flex">
              <div class="h-4 bg-gray-200 rounded w-24"></div>
              <div class="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
            </div>
          </div>
          <!-- Row skeletons -->
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <div class="px-6 py-4 border-b border-gray-100">
              <div class="flex items-center">
                <div class="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div class="ml-4 flex-1">
                  <div class="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div class="h-3 bg-gray-100 rounded w-48"></div>
                </div>
                <div class="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          }
        </div>
      </div>
    } @else {
      <app-data-table
        [data]="customers"
        [columns]="columns"
        [isLoading]="false"
        [showActions]="true"
        [sortColumn]="sortColumn"
        [sortDirection]="sortDirection"
        [emptyMessage]="'No customers match your search criteria'"
        (rowClick)="onCustomerClick($event)"
        (sort)="onSort($event)"
      >
        <ng-template #cellTemplate let-item let-column="column" let-value="value">
          @switch (column.key) {
            @case ('name') {
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                    <span class="text-sm font-semibold text-white">
                      {{ getInitials(item.name) }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ value }}</div>
                  @if (item.notes) {
                    <div class="text-xs text-gray-500 truncate max-w-[200px]">{{ item.notes }}</div>
                  }
                </div>
              </div>
            }
            @case ('email') {
              <div class="flex items-center">
                @if (value) {
                  <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span class="text-sm text-gray-900">{{ value }}</span>
                } @else {
                  <span class="text-sm text-gray-400">-</span>
                }
              </div>
            }
            @case ('phone') {
              <div class="flex items-center">
                @if (value) {
                  <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span class="text-sm text-gray-900">{{ value }}</span>
                } @else {
                  <span class="text-sm text-gray-400">-</span>
                }
              </div>
            }
            @case ('createdAt') {
              <div class="text-sm text-gray-500 text-left">{{ value | date:'MMM d, y' }}</div>
            }
            @default {
              <div class="text-sm text-gray-900">{{ value }}</div>
            }
          }
        </ng-template>

        <ng-template #rowActionsTemplate let-item>
          <div class="flex items-center space-x-1">
            <button
              (click)="onCustomerClick(item); $event.stopPropagation()"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              View
            </button>
            <button
              (click)="onEditCustomer($event, item); $event.stopPropagation()"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Edit
            </button>
            <button
              (click)="onDeleteCustomer($event, item); $event.stopPropagation()"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Delete
            </button>
          </div>
        </ng-template>
      </app-data-table>
    }

    @if (totalCustomers > 0 && !isLoading) {
      <div class="mt-4">
        <app-pagination
          [currentPage]="currentPage"
          [totalItems]="totalCustomers"
          [itemsPerPage]="pageSize"
          (pageChange)="onPageChange($event)"
        />
      </div>
    }
  `
})
export class CustomerListComponent {
  @Input() customers: Customer[] = [];
  @Input() isLoading = false;
  @Input() totalCustomers = 0;
  @Input() currentPage = 1;
  @Input() pageSize = 25;
  @Input() sortColumn = 'name';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';

  @Output() customerSelected = new EventEmitter<Customer>();
  @Output() customerEdit = new EventEmitter<Customer>();
  @Output() customerDelete = new EventEmitter<Customer>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ column: string; direction: 'asc' | 'desc' }>();

  protected columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true, width: '30%' },
    { key: 'email', label: 'Email', sortable: true, width: '25%' },
    { key: 'phone', label: 'Phone', sortable: false, width: '20%' },
    { key: 'createdAt', label: 'Created', sortable: true, width: '15%', align: 'right' }
  ];

  protected onCustomerClick(customer: Customer): void {
    this.customerSelected.emit(customer);
  }

  protected onEditCustomer(event: Event, customer: Customer): void {
    event.stopPropagation();
    this.customerEdit.emit(customer);
  }

  protected onDeleteCustomer(event: Event, customer: Customer): void {
    event.stopPropagation();
    this.customerDelete.emit(customer);
  }

  protected onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  protected onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.sortChange.emit(event);
  }

  protected getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}