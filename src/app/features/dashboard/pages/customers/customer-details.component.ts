import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customer } from '../../../../shared/models/customer.model';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (customer) {
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span class="text-lg font-medium text-blue-700">
                    {{ getInitials(customer.name) }}
                  </span>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ customer.name }}</h3>
                <p class="text-sm text-gray-500">Customer ID: {{ customer.shortId }}</p>
              </div>
            </div>
            <button
              (click)="onClose()"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Contact Information -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
              <div class="space-y-3">
                <div class="flex items-center">
                  <svg class="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span class="text-sm text-gray-900">{{ customer.email || 'No email provided' }}</span>
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span class="text-sm text-gray-900">{{ customer.phone || 'No phone provided' }}</span>
                </div>
              </div>
            </div>

            <!-- Account Information -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-3">Account Information</h4>
              <div class="space-y-3">
                <div>
                  <span class="text-xs text-gray-500">Created</span>
                  <p class="text-sm text-gray-900">{{ customer.createdAt | date:'medium' }}</p>
                </div>
                <div>
                  <span class="text-xs text-gray-500">Last Updated</span>
                  <p class="text-sm text-gray-900">{{ customer.updatedAt | date:'medium' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          @if (customer.notes) {
            <div class="mt-6">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Notes</h4>
              <div class="bg-gray-50 rounded-md p-3">
                <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ customer.notes }}</p>
              </div>
            </div>
          }

          <!-- Actions -->
          <div class="mt-6 flex justify-end space-x-3">
            @if (customer.email) {
              <button
                (click)="onEmail()"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Send Email
              </button>
            }
            <button
              (click)="onEdit()"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Edit Customer
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class CustomerDetailsComponent {
  @Input() customer: Customer | null = null;
  
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Customer>();
  @Output() email = new EventEmitter<Customer>();

  protected onClose(): void {
    this.close.emit();
  }

  protected onEdit(): void {
    if (this.customer) {
      this.edit.emit(this.customer);
    }
  }

  protected onEmail(): void {
    if (this.customer) {
      this.email.emit(this.customer);
    }
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