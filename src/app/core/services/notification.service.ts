import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly _toasts = signal<Toast[]>([]);
  public readonly toasts = computed(() => this._toasts());

  public show(type: ToastType, message: string, duration: number = 3000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, type, message, duration };
    
    this._toasts.update(toasts => [...toasts, newToast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  public success(message: string, duration?: number): void {
    this.show('success', message, duration);
  }

  public error(message: string, duration?: number): void {
    this.show('error', message, duration);
  }

  public info(message: string, duration?: number): void {
    this.show('info', message, duration);
  }

  public remove(id: string): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
}
