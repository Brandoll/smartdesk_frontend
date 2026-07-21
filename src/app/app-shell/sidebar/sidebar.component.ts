import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../core/state/app-state.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="sidebar">
      <!-- Brand -->
      <div class="sidebar-brand">
        <img [src]="'assets/logo-light.png'" alt="SmartDesk" class="sidebar-logo" />
        <div>
          <h1 class="sidebar-title">SmartDesk</h1>
        </div>
      </div>

      <!-- New Ticket Button -->
      <button class="new-ticket-btn" routerLink="/app/tickets/new">
        <span class="material-symbols-outlined">add</span>
        <span>Nuevo Ticket</span>
      </button>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <a routerLink="/app/dashboard" routerLinkActive="nav-item-active" class="nav-link group">
          <span class="icon-box group-hover:!bg-[var(--surface-container-highest)]"><span class="material-symbols-outlined">dashboard</span></span>
          <span>Dashboard</span>
        </a>
        <a routerLink="/app/tickets" routerLinkActive="nav-item-active" class="nav-link group" [routerLinkActiveOptions]="{exact: true}">
          <span class="icon-box group-hover:!bg-[var(--surface-container-highest)]"><span class="material-symbols-outlined">confirmation_number</span></span>
          <span>Mis Tickets</span>
        </a>
        @if (isAdminOrResolutor()) {
          <a routerLink="/app/area-tickets" routerLinkActive="nav-item-active" class="nav-link group">
            <span class="icon-box group-hover:!bg-[var(--surface-container-highest)]"><span class="material-symbols-outlined">group_work</span></span>
            <span>Tickets de Área</span>
          </a>
        }
        @if (isAdmin()) {
          <a routerLink="/app/users" routerLinkActive="nav-item-active" class="nav-link group">
            <span class="icon-box group-hover:!bg-[var(--surface-container-highest)]"><span class="material-symbols-outlined">group</span></span>
            <span>Colaboradores</span>
          </a>
          <a routerLink="/app/areas" routerLinkActive="nav-item-active" class="nav-link group">
            <span class="icon-box group-hover:!bg-[var(--surface-container-highest)]"><span class="material-symbols-outlined">domain</span></span>
            <span>Áreas</span>
          </a>
        }
        <a routerLink="/app/settings" routerLinkActive="nav-item-active" class="nav-link group">
          <span class="icon-box group-hover:!bg-[var(--surface-container-highest)]"><span class="material-symbols-outlined">settings</span></span>
          <span>Configuración</span>
        </a>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <button class="nav-link-footer text-error" (click)="logout()">
          <span class="material-symbols-outlined" style="opacity:0.8">logout</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>

      <!-- User Profile -->
      <div class="sidebar-user" routerLink="/app/profile" style="cursor:pointer" title="Ver perfil">
        <div class="sidebar-user-avatar">
          {{ getInitials(appState.currentUser()?.name) }}
        </div>
        <div class="sidebar-user-info">
          <p class="sidebar-user-name" [title]="appState.currentUser()?.name">{{ appState.currentUser()?.name || 'Usuario' }}</p>
          <p class="sidebar-user-role">{{ formatRole(appState.currentUser()?.role) }}</p>
        </div>
        <span class="material-symbols-outlined" style="font-size:18px; opacity:0.5; margin-left:auto">chevron_right</span>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      flex-shrink: 0;
      height: 100vh;
      background: var(--surface-container-lowest);
      border-right: 1px solid var(--outline-variant);
      display: flex;
      flex-direction: column;
      padding: 24px;
      overflow: hidden;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 8px;
      margin-bottom: 32px;
    }

    .sidebar-logo {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      object-fit: contain;
    }

    .sidebar-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #111111;
      line-height: 1.1;
    }

    .new-ticket-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: var(--primary);
      color: var(--on-primary);
      border: none;
      padding: 14px 20px;
      border-radius: 12px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 24px;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(240, 80, 35, 0.2);
    }

    .new-ticket-btn:hover {
      box-shadow: 0 8px 24px rgba(240, 80, 35, 0.3);
      transform: translateY(-2px);
    }

    .new-ticket-btn:active {
      transform: scale(0.97);
    }

    .new-ticket-btn .material-symbols-outlined {
      font-size: 18px;
      transition: transform 0.2s;
    }

    .new-ticket-btn:hover .material-symbols-outlined {
      transform: rotate(90deg);
    }

    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 10px;
      font-family: 'Hanken Grotesk', sans-serif;
      font-size: 15px;
      font-weight: 500;
      color: var(--on-surface-variant);
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
    }

    .nav-link:hover {
      background: var(--surface-container-low);
      color: var(--on-surface);
    }

    .nav-link.nav-item-active {
      background: rgba(240, 80, 35, 0.08);
      color: var(--primary);
      font-weight: 600;
    }

    .nav-link.nav-item-active .icon-box {
      background: var(--primary);
      color: white;
    }

    .icon-box {
      background: transparent;
      color: var(--on-surface-variant);
    }

    .nav-link:hover .icon-box {
      color: var(--on-surface);
    }

    .sidebar-footer {
      padding-top: 16px;
      margin-top: auto;
      border-top: 1px solid var(--outline-variant);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-link-footer {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 10px;
      font-family: 'Hanken Grotesk', sans-serif;
      font-size: 15px;
      font-weight: 500;
      color: var(--on-surface-variant);
      text-decoration: none;
      transition: all 0.2s;
      background: transparent;
      border: none;
      cursor: pointer;
      width: 100%;
      text-align: left;
    }

    .nav-link-footer:hover {
      background: var(--surface-container-low);
      color: var(--on-surface);
    }

    .nav-link-footer.text-error:hover {
      background: rgba(186, 26, 26, 0.08);
      color: var(--error);
    }

    .sidebar-user {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 10px;
      margin-top: 12px;
      background: var(--surface-container-low);
      border-radius: 12px;
      transition: background 0.2s;
    }
    
    .sidebar-user:hover {
      background: var(--surface-container);
    }

    .sidebar-user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary-fixed);
      color: var(--on-primary-container);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }

    .sidebar-user-info {
      min-width: 0;
    }

    .sidebar-user-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: var(--on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar-user-role {
      font-family: 'Hanken Grotesk', sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: var(--on-surface-variant);
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 2px;
    }
  `]
})
export class SidebarComponent {
  public appState = inject(AppStateService);
  private authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  formatRole(role?: string): string {
    if (!role) return 'USUARIO';
    const cleanRole = role.replace('ROLE_', '');
    switch(cleanRole) {
      case 'ADMIN_TENANT': return 'ADMINISTRADOR';
      case 'COLABORADOR_RESOLUTOR': return 'RESOLUTOR';
      case 'COLABORADOR': return 'COLABORADOR';
      default: return cleanRole;
    }
  }

  isAdmin(): boolean {
    const role = this.appState.currentUser()?.role?.replace('ROLE_', '');
    return role === 'ADMIN_TENANT';
  }

  isAdminOrResolutor(): boolean {
    const role = this.appState.currentUser()?.role?.replace('ROLE_', '');
    return role === 'ADMIN_TENANT' || role === 'COLABORADOR_RESOLUTOR';
  }
}
