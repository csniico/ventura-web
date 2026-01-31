import { Component, Input, Output, EventEmitter, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Invoice, UpdateInvoicePaymentDto, PaymentMethod } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-payment-modal',
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
              <h2 class="text-lg font-semibold text-gray-900">Record Payment</h2>
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
                <!-- Invoice Info -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-gray-500">Invoice</span>
                    <span class="font-medium text-gray-900">{{ invoice.invoiceNumber }}</span>
                  </div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-gray-500">Total Amount</span>
                    <span class="font-medium text-gray-900">{{ invoice.totalAmount | currency:'GHS ' }}</span>
                  </div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-gray-500">Amount Paid</span>
                    <span class="text-green-600">{{ invoice.amountPaid | currency:'GHS ' }}</span>
                  </div>
                  <div class="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span class="text-sm font-medium text-gray-700">Balance Due</span>
                    <span class="font-semibold text-gray-900">{{ balanceDue() | currency:'GHS ' }}</span>
                  </div>
                </div>

                <!-- Payment Amount -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Payment Amount *</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">GHS</span>
                    <input
                      type="number"
                      [ngModel]="amountPaid()"
                      (ngModelChange)="amountPaid.set($event)"
                      name="amountPaid"
                      [min]="0"
                      [max]="balanceDue()"
                      step="0.01"
                      class="w-full pl-12 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div class="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      (click)="setFullPayment()"
                      class="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Pay Full Balance
                    </button>
                    @if (amountPaid() > balanceDue()) {
                      <span class="text-xs text-red-600">Exceeds balance due</span>
                    }
                  </div>
                </div>

                <!-- Payment Method -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                  <select
                    [ngModel]="paymentMethod()"
                    (ngModelChange)="paymentMethod.set($event)"
                    name="paymentMethod"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select payment method</option>
                    @for (method of paymentMethods; track method.value) {
                      <option [value]="method.value">{{ method.label }}</option>
                    }
                  </select>
                </div>

                <!-- Payment Date -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                  <input
                    type="date"
                    [ngModel]="paymentDate()"
                    (ngModelChange)="paymentDate.set($event)"
                    name="paymentDate"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
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
                class="px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
              >
                @if (isSubmitting()) {
                  <span class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Recording...
                  </span>
                } @else {
                  Record Payment
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class InvoicePaymentModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() invoice!: Invoice;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ invoiceId: string; dto: UpdateInvoicePaymentDto }>();

  protected amountPaid = signal(0);
  protected paymentMethod = signal<PaymentMethod | ''>('');
  protected paymentDate = signal('');
  protected isSubmitting = signal(false);

  protected readonly paymentMethods = [
    { value: PaymentMethod.CASH, label: 'Cash' },
    { value: PaymentMethod.MOBILE_MONEY, label: 'Mobile Money' },
    { value: PaymentMethod.BANK_TRANSFER, label: 'Bank Transfer' },
    { value: PaymentMethod.CARD, label: 'Card' },
    { value: PaymentMethod.CHEQUE, label: 'Cheque' }
  ];

  protected balanceDue = computed(() => {
    return this.invoice ? this.invoice.totalAmount - this.invoice.amountPaid : 0;
  });

  protected isValid = computed(() => {
    const amount = this.amountPaid();
    return amount > 0 &&
           amount <= this.balanceDue() &&
           this.paymentMethod() !== '';
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.resetForm();
    }
  }

  protected resetForm(): void {
    this.amountPaid.set(this.balanceDue());
    this.paymentMethod.set('');
    this.paymentDate.set(new Date().toISOString().split('T')[0]);
    this.isSubmitting.set(false);
  }

  protected setFullPayment(): void {
    this.amountPaid.set(this.balanceDue());
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    const dto: UpdateInvoicePaymentDto = {
      amountPaid: this.amountPaid(),
      paymentMethod: this.paymentMethod() as PaymentMethod,
      paymentDate: this.paymentDate() || undefined
    };

    this.save.emit({ invoiceId: this.invoice.id, dto });
  }

  protected onClose(): void {
    this.close.emit();
  }
}
