import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);

  readonly notifications$ = this.notifications.asReadonly();

  showSuccess(message: string, duration = 5000): void {
    this.addNotification('success', message, duration);
  }

  showError(message: string, duration = 7000): void {
    this.addNotification('error', message, duration);
  }

  showWarning(message: string, duration = 6000): void {
    this.addNotification('warning', message, duration);
  }

  showInfo(message: string, duration = 5000): void {
    this.addNotification('info', message, duration);
  }

  remove(id: string): void {
    this.notifications.update(notifications => 
      notifications.filter(n => n.id !== id)
    );
  }

  clear(): void {
    this.notifications.set([]);
  }

  private addNotification(type: Notification['type'], message: string, duration: number): void {
    const id = this.generateId();
    const notification: Notification = { id, type, message, duration };

    this.notifications.update(notifications => [...notifications, notification]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}