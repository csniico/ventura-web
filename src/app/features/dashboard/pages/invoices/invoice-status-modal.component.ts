import { Component, Input, Output, EventEmitter, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Invoice, InvoiceStatus } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-status-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-900/50" (click)="onClose()"></div>

        <!-- Modal -->
        <div class="relative min-h-screen flex items-center justify-center p-4">
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Update Invoice Status</h2>
              <button
                (click)="onClose()"
                class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="px-6 py-4">
              <form (ngSubmit)="onSubmit()" class="space-y-4">
                <!-- Current Status -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">Current Status</span>
                    <span
                      class="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full"
                      [ngClass]="getStatusClasses(invoice.status)"
                    >
                      {{ getStatusLabel(invoice.status) }}
                    </span>
                  </div>
                </div>

                <!-- New Status -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                  <div class="space-y-2">
                    @for (status of availableStatuses(); track status.value) {
                      <label
                        class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        [class.border-blue-500]="selectedStatus() === status.value"
                        [class.bg-blue-50]="selectedStatus() === status.value"
                      >
                        <input
                          type="radio"
                          [value]="status.value"
                          [checked]="selectedStatus() === status.value"
                          (change)="selectedStatus.set(status.value)"
                          name="status"
                          class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div class="ml-3">
                          <span class="font-medium text-gray-900">{{ status.label }}</span>
                          <p class="text-xs text-gray-500">{{ status.description }}</p>
                        </div>
                      </label>
                    }
                  </div>
                </div>
              </form>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                (click)="onClose()"
                class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="onSubmit()"
                [disabled]="!isValid() || isSubmitting()"
                class="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
              >
                @if (isSubmitting()) {
                  <span class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                } @else {
                  Update Status
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class InvoiceStatusModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() invoice!: Invoice;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ invoiceId: string; status: InvoiceStatus }>();

  protected selectedStatus = signal<InvoiceStatus | null>(null);
  protected isSubmitting = signal(false);

  protected readonly allStatuses = [
    { value: InvoiceStatus.DRAFT, label: 'Draft', description: 'Invoice is being prepared' },
    { value: InvoiceStatus.SENT, label: 'Sent', description: 'Invoice has been sent to customer' },
    { value: InvoiceStatus.OVERDUE, label: 'Overdue', description: 'Payment is past due date' },
    { value: InvoiceStatus.CANCELLED, label: 'Cancelled', description: 'Invoice has been cancelled' }
  ];

  protected availableStatuses = computed(() => {
    if (!this.invoice) return [];
    return this.allStatuses.filter(s => s.value !== this.invoice.status);
  });

  protected isValid = computed(() => {
    return this.selectedStatus() !== null && this.selectedStatus() !== this.invoice?.status;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.selectedStatus.set(null);
      this.isSubmitting.set(false);
    }
  }

  protected getStatusClasses(status: InvoiceStatus): string {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return 'bg-gray-50 text-gray-700';
      case InvoiceStatus.SENT:
        return 'bg-blue-50 text-blue-700';
      case InvoiceStatus.PAID:
        return 'bg-green-50 text-green-700';
      case InvoiceStatus.PARTIALLY_PAID:
        return 'bg-amber-50 text-amber-700';
      case InvoiceStatus.OVERDUE:
        return 'bg-red-50 text-red-700';
      case InvoiceStatus.CANCELLED:
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  }

  protected getStatusLabel(status: InvoiceStatus): string {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return 'Draft';
      case InvoiceStatus.SENT:
        return 'Sent';
      case InvoiceStatus.PAID:
        return 'Paid';
      case InvoiceStatus.PARTIALLY_PAID:
        return 'Partially Paid';
      case InvoiceStatus.OVERDUE:
        return 'Overdue';
      case InvoiceStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.save.emit({
      invoiceId: this.invoice.id,
      status: this.selectedStatus()!
    });
  }

  protected onClose(): void {
    this.close.emit();
  }
}
