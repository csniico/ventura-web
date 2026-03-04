import { Component, Input, Output, EventEmitter, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Customer, CreateCustomerDto } from '../../../../shared/models/customer.model';

@Component({
  selector: 'app-customer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm mr-3">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ isEditMode() ? 'Edit Customer' : 'New Customer' }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    {{ isEditMode() ? 'Update customer information' : 'Add a new customer to your database' }}
                  </p>
                </div>
              </div>
              <button
                type="button"
                (click)="onCancel()"
                class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <form [formGroup]="customerForm" (ngSubmit)="onSubmit()">
            <div class="px-6 py-5 space-y-5">
              <!-- Name Field -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    formControlName="name"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter customer name"
                  />
                </div>
                @if (customerForm.get('name')?.errors?.['required'] && customerForm.get('name')?.touched) {
                  <p class="text-red-600 text-sm mt-1.5 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    Name is required
                  </p>
                }
              </div>

              <!-- Email Field -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <input
                    type="email"
                    formControlName="email"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="customer@example.com"
                  />
                </div>
                @if (customerForm.get('email')?.errors?.['email'] && customerForm.get('email')?.touched) {
                  <p class="text-red-600 text-sm mt-1.5 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    Please enter a valid email address
                  </p>
                }
              </div>

              <!-- Phone Field -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </div>
                  <input
                    type="tel"
                    formControlName="phone"
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <!-- Notes Field -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Notes
                </label>
                <textarea
                  formControlName="notes"
                  rows="3"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Add any additional notes about this customer..."
                ></textarea>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
              <button
                type="button"
                (click)="onCancel()"
                class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="customerForm.invalid || isSubmitting() || (isEditMode() && !customerForm.dirty)"
                class="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                @if (isSubmitting()) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                } @else {
                  {{ isEditMode() ? 'Update Customer' : 'Create Customer' }}
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class CustomerModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() customer: Customer | null = null;
  @Input() businessId = '';

  @Output() save = new EventEmitter<CreateCustomerDto>();
  @Output() update = new EventEmitter<{ id: string; data: Partial<Customer> }>();
  @Output() cancel = new EventEmitter<void>();

  protected customerForm: FormGroup;
  protected isEditMode = signal(false);
  protected isSubmitting = signal(false);

  constructor(private fb: FormBuilder) {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.email]],
      phone: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.setupForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Only setup form when modal opens or customer changes
    if (changes['isOpen']?.currentValue === true || changes['customer']) {
      this.setupForm();
    }
  }

  private setupForm(): void {
    // Always reset submitting state when modal opens/changes
    this.isSubmitting.set(false);

    if (this.customer) {
      this.isEditMode.set(true);
      this.customerForm.patchValue({
        name: this.customer.name,
        email: this.customer.email || '',
        phone: this.customer.phone || '',
        notes: this.customer.notes || ''
      });
      // Mark form as pristine after patching values
      this.customerForm.markAsPristine();
    } else {
      this.isEditMode.set(false);
      this.customerForm.reset();
    }
  }

  protected onSubmit(): void {
    if (this.customerForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.customerForm.value;

    if (this.isEditMode() && this.customer) {
      this.update.emit({
        id: this.customer.id,
        data: formValue
      });
    } else {
      this.save.emit({
        businessId: this.businessId,
        ...formValue
      });
    }
  }

  protected onCancel(): void {
    this.customerForm.reset();
    this.isSubmitting.set(false);
    this.cancel.emit();
  }

  public resetSubmitting(): void {
    this.isSubmitting.set(false);
  }
}