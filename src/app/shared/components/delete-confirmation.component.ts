import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DeleteConfirmationData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

@Component({
  selector: 'app-delete-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div 
        class="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50"
        (click)="onBackdropClick($event)"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div class="px-6 py-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">
                  {{ data?.title || 'Confirm Delete' }}
                </h3>
                <p class="text-sm text-gray-500 mt-1">
                  {{ data?.message || 'Are you sure you want to delete this item?' }}
                </p>
              </div>
            </div>
          </div>

          @if (errorMessage()) {
            <div class="px-6 py-2">
              <div class="bg-red-50 border border-red-200 rounded-md p-3">
                <p class="text-sm text-red-600">{{ errorMessage() }}</p>
              </div>
            </div>
          }

          <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              (click)="onCancel()"
              [disabled]="isDeleting()"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              {{ data?.cancelText || 'Cancel' }}
            </button>
            <button
              type="button"
              (click)="onConfirm()"
              [disabled]="isDeleting()"
              [class]="getConfirmButtonClass()"
            >
              {{ isDeleting() ? 'Deleting...' : (data?.confirmText || 'Delete') }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class DeleteConfirmationComponent {
  @Input() isOpen = false;
  @Input() data: DeleteConfirmationData | null = null;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  protected isDeleting = signal(false);
  protected errorMessage = signal('');

  protected onConfirm(): void {
    this.confirm.emit();
  }

  protected onCancel(): void {
    this.cancel.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.isDeleting()) {
      this.onCancel();
    }
  }

  protected getConfirmButtonClass(): string {
    const baseClass = 'px-4 py-2 text-sm font-medium border border-transparent rounded-md disabled:opacity-50';
    const destructiveClass = 'text-white bg-red-600 hover:bg-red-700';
    const normalClass = 'text-white bg-blue-600 hover:bg-blue-700';
    
    return `${baseClass} ${this.data?.isDestructive !== false ? destructiveClass : normalClass}`;
  }

  public setDeleting(deleting: boolean): void {
    this.isDeleting.set(deleting);
  }

  public setError(error: string): void {
    this.errorMessage.set(error);
  }

  public clearError(): void {
    this.errorMessage.set('');
  }
}