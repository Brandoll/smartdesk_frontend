import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms
}

export interface AppNotification {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  read: boolean;
  ticketId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly recentlySeen = new Map<string, number>();
  private readonly _toasts = signal<Toast[]>([]);
  public readonly toasts = computed(() => this._toasts());

  private readonly _notifications = signal<AppNotification[]>([]);
  public readonly notifications = computed(() =>
    [...this._notifications()].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  );
  public readonly unreadCount = computed(() => this._notifications().filter(n => !n.read).length);

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

  /** Add a persistent notification to the history */
  public addNotification(type: string, message: string, ticketId?: string): boolean {
    const dedupeKey = `${type}|${ticketId || ''}|${message}`;
    const now = Date.now();
    const lastSeen = this.recentlySeen.get(dedupeKey) || 0;
    if (now - lastSeen < 3000) return false;
    this.recentlySeen.set(dedupeKey, now);
    const id = Math.random().toString(36).substring(2, 9);
    const notification: AppNotification = {
      id,
      type,
      message,
      timestamp: new Date(),
      read: false,
      ticketId
    };
    this._notifications.update(list => [notification, ...list].slice(0, 50)); // keep last 50
    return true;
  }

  public markAllRead(): void {
    this._notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  public markRead(id: string): void {
    this._notifications.update(list =>
      list.map(notification => notification.id === id ? { ...notification, read: true } : notification)
    );
  }

  public clearNotifications(): void {
    this._notifications.set([]);
  }
}
