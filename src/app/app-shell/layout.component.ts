import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
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
export class LayoutComponent {}
