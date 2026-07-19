import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('toastAnimation', [
      state('void', style({ opacity: 0, transform: 'translateY(-20px) scale(0.95)' })),
      transition(':enter', [
        animate('300ms cubic-bezier(0.2, 1, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px) scale(0.95)' }))
      ])
    ])
  ],
  template: `
    <div class="toast-container">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div @toastAnimation class="toast-item" [attr.data-type]="toast.type">
          <span class="material-symbols-outlined toast-icon" [style.font-variation-settings]="'FILL 1'">
            {{ toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info' }}
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button (click)="notificationService.remove(toast.id)" class="toast-close">
            <span class="material-symbols-outlined" style="font-size:16px">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .toast-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      background: var(--surface-container-lowest);
      border: 1px solid var(--surface-container);
      border-radius: 12px;
      box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.15);
      font-family: 'Geist', sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: var(--on-surface);
      max-width: 400px;
      min-width: 300px;
      backdrop-filter: blur(12px);
    }

    .toast-item[data-type="success"] .toast-icon { color: #22c55e; }
    .toast-item[data-type="error"] .toast-icon { color: var(--error); }
    .toast-item[data-type="info"] .toast-icon { color: var(--primary); }

    .toast-message {
      flex: 1;
      line-height: 1.4;
    }

    .toast-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      color: var(--on-surface-variant);
      opacity: 0.5;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .toast-close:hover {
      opacity: 1;
      background: var(--surface-container);
    }
  `]
})
export class ToastComponent {
  public notificationService = inject(NotificationService);
}
