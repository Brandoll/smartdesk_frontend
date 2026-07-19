import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppStateService } from '../../core/state/app-state.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar">
      <!-- Search -->
      <div class="topbar-search-wrapper">
        <div class="topbar-search">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            type="text"
            placeholder="Buscar tickets, operaciones o áreas..."
            class="search-input"
          />
          <div class="search-shortcut">
            <span>⌘</span><span>K</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="topbar-actions">
        <div class="topbar-icons">
          <button class="icon-btn" title="Notificaciones">
            <span class="material-symbols-outlined">notifications</span>
          </button>
          <button class="icon-btn" title="Historial">
            <span class="material-symbols-outlined">history</span>
          </button>
        </div>

        <div class="topbar-divider"></div>

        <!-- User -->
        <div class="topbar-user-container">
          <div class="topbar-user" (click)="showUserMenu.set(!showUserMenu())">
            <div class="topbar-user-info">
              <p class="topbar-user-name">{{ appState.currentUser()?.name || 'Usuario' }}</p>
              <p class="topbar-user-role">{{ formatRole(appState.currentUser()?.role) }}</p>
            </div>
            <div class="topbar-user-avatar">
              {{ getInitials(appState.currentUser()?.name) }}
            </div>
          </div>
          
          <!-- Dropdown Menu -->
          @if (showUserMenu()) {
            <div class="user-dropdown-menu">
              <div class="dropdown-header">
                <p class="dropdown-name">{{ appState.currentUser()?.name }}</p>
                <p class="dropdown-email">{{ appState.currentUser()?.email }}</p>
              </div>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item" (click)="navigateToProfile()">
                <span class="material-symbols-outlined">person</span>
                Mi Perfil
              </button>
              <button class="dropdown-item" (click)="navigateToSettings()">
                <span class="material-symbols-outlined">settings</span>
                Configuración
              </button>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item text-error" (click)="logout()">
                <span class="material-symbols-outlined">logout</span>
                Cerrar Sesión
              </button>
            </div>
            <!-- Overlay to close menu when clicking outside -->
            <div class="dropdown-overlay" (click)="showUserMenu.set(false)"></div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      width: 100%;
      height: 72px;
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(251, 248, 255, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--outline-variant);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 40px;
    }

    .topbar-search-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
    }

    .topbar-search {
      position: relative;
      width: 100%;
      max-width: 480px;
    }

    .search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--on-surface-variant);
      opacity: 0.6;
      font-size: 20px;
    }

    .search-input {
      width: 100%;
      padding: 10px 60px 10px 44px;
      background: var(--surface-container-lowest);
      border: 1px solid var(--outline-variant);
      border-radius: 9999px;
      font-family: 'Manrope', sans-serif;
      font-size: 14px;
      color: var(--on-surface);
      outline: none;
      transition: all 0.2s;
    }

    .search-input::placeholder {
      opacity: 0.4;
    }

    .search-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 1px var(--primary);
    }

    .search-shortcut {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      gap: 3px;
    }

    .search-shortcut span {
      padding: 2px 6px;
      background: var(--surface-container);
      border: 1px solid var(--outline-variant);
      border-radius: 4px;
      font-family: 'Geist', sans-serif;
      font-size: 11px;
      color: var(--on-surface-variant);
      opacity: 0.6;
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .topbar-icons {
      display: flex;
      align-items: center;
      gap: 4px;
      padding-right: 12px;
    }

    .icon-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: var(--on-surface-variant);
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .icon-btn:hover {
      background: var(--surface-container);
    }

    .topbar-divider {
      width: 1px;
      height: 24px;
      background: var(--outline-variant);
    }

    .topbar-user-container {
      position: relative;
    }

    .topbar-user {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-left: 12px;
      cursor: pointer;
    }

    .topbar-user:hover .topbar-user-name {
      color: var(--primary);
    }

    .topbar-user-info {
      text-align: right;
    }

    .topbar-user-name {
      font-family: 'Geist', sans-serif;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.02em;
      color: var(--on-surface);
      transition: color 0.2s;
    }

    .topbar-user-role {
      font-family: 'Geist', sans-serif;
      font-size: 10px;
      font-weight: 600;
      color: var(--on-surface-variant);
      opacity: 0.4;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .topbar-user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 9999px;
      overflow: hidden;
      background: var(--primary-container);
      color: var(--on-primary-container);
      border: 1px solid var(--outline-variant);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Geist', sans-serif;
      font-weight: 600;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .topbar-user:hover .topbar-user-avatar {
      border-color: var(--primary);
    }

    /* Dropdown Menu Styles */
    .user-dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 240px;
      background: var(--surface-container-lowest);
      border: 1px solid var(--outline-variant);
      border-radius: 16px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
      padding: 8px 0;
      z-index: 101;
      animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .dropdown-header {
      padding: 12px 20px;
    }

    .dropdown-name {
      font-family: 'Geist', sans-serif;
      font-weight: 600;
      font-size: 14px;
      color: var(--on-surface);
    }

    .dropdown-email {
      font-family: 'Manrope', sans-serif;
      font-size: 12px;
      color: var(--on-surface-variant);
      opacity: 0.7;
      margin-top: 2px;
    }

    .dropdown-divider {
      height: 1px;
      background: var(--outline-variant);
      margin: 8px 0;
    }

    .dropdown-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 20px;
      background: transparent;
      border: none;
      font-family: 'Geist', sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: var(--on-surface);
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
    }

    .dropdown-item:hover {
      background: var(--surface-container-low);
    }

    .dropdown-item .material-symbols-outlined {
      font-size: 18px;
      opacity: 0.7;
    }

    .dropdown-item.text-error {
      color: var(--error);
    }

    .dropdown-item.text-error .material-symbols-outlined {
      color: var(--error);
      opacity: 1;
    }

    .dropdown-overlay {
      position: fixed;
      inset: 0;
      z-index: 100;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class TopbarComponent {
  private router = inject(Router);
  public appState = inject(AppStateService);
  private authService = inject(AuthService);

  showUserMenu = signal(false);

  navigateToProfile() {
    this.showUserMenu.set(false);
    this.router.navigate(['/app/settings'], { queryParams: { tab: 'profile' } });
  }

  navigateToSettings() {
    this.showUserMenu.set(false);
    this.router.navigate(['/app/settings'], { queryParams: { tab: 'settings' } });
  }

  logout() {
    this.showUserMenu.set(false);
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
}
