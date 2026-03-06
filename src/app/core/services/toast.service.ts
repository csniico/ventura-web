import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly message = signal('');
  readonly type = signal<ToastType>('success');

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  show(message: string, type: ToastType = 'success', duration = 3000): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.message.set(message);
    this.type.set(type);
    this.timeoutId = setTimeout(() => this.dismiss(), duration);
  }

  success(message: string, duration = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 4000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 3000): void {
    this.show(message, 'info', duration);
  }

  dismiss(): void {
    this.message.set('');
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
