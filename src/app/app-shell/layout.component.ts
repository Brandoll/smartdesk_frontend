import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { WebsocketService } from '../core/services/websocket.service';
import { AudioNotificationService } from '../core/services/audio-notification.service';
import { NotificationService } from '../core/services/notification.service';
import { AppStateService } from '../core/state/app-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, CommonModule],
  template: `
    <div class="app-shell">
      <app-sidebar></app-sidebar>
      <div class="app-main-wrapper">
        <app-topbar></app-topbar>
        <main class="app-main-scrollable">
          <div class="app-content">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--surface);
    }

    .app-main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      height: 100vh;
    }

    .app-main-scrollable {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .app-content {
      padding: 40px;
      max-width: 1440px;
      margin: 0 auto;
      width: 100%;
      min-height: 100%;
    }

    @media (max-width: 768px) {
      .app-content {
        padding: 20px;
      }
    }
  `]
})
export class LayoutComponent implements OnInit, OnDestroy {
  private ws = inject(WebsocketService);
  private audioService = inject(AudioNotificationService);
  public notification = inject(NotificationService);
  private appState = inject(AppStateService);
  private notifSub?: Subscription;

  ngOnInit() {
    const user = this.appState.currentUser();
    const tenant = this.appState.currentTenant();
    
    if (user && tenant) {
      this.ws.connectNotifications(user.id, tenant.id, user.role);
      
      this.notifSub = this.ws.getNotifications().subscribe(msg => {
        // Play sound
        // Show floating toast
        const message = msg['message'] || 'Nueva notificación';
        // Store in history
        const added = this.notification.addNotification(msg['type'] || 'info', message, msg['ticketId']);
        if (added) {
          this.audioService.play();
          this.notification.info(message, 5000);
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.notifSub) {
      this.notifSub.unsubscribe();
    }
    this.ws.disconnectNotifications();
  }
}
