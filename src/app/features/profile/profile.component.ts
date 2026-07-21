import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppStateService } from '../../core/state/app-state.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-page">
      <header class="page-header">
        <div>
          <p class="section-label">MI CUENTA</p>
          <h2 class="text-headline-lg">Perfil</h2>
          <p class="page-description">Consulta tu identidad y acceso dentro de SmartDesk.</p>
        </div>
        <button type="button" class="settings-button" (click)="openProfileSettings()">
          <span class="material-symbols-outlined">edit</span>
          Editar información
        </button>
      </header>

      <section class="identity-panel">
        <div class="profile-avatar">
          <span class="material-symbols-outlined">person</span>
        </div>
        <div class="identity-copy">
          <h3>{{ user()?.name || 'Usuario' }}</h3>
          <p>{{ user()?.email || 'Correo no disponible' }}</p>
          <div class="identity-tags">
            <span class="role-tag">{{ formatRole(user()?.role) }}</span>
            <span class="tenant-tag">{{ tenant()?.name || 'Organización no disponible' }}</span>
          </div>
        </div>
        <div class="session-state">
          <span class="state-dot"></span>
          Sesión activa
        </div>
      </section>

      <div class="profile-grid">
        <section class="profile-card account-card">
          <div class="card-heading">
            <p class="section-label">INFORMACIÓN DE CUENTA</p>
            <h3>Datos registrados</h3>
            <p>Esta información proviene de tu cuenta y organización actuales.</p>
          </div>

          <div class="details-list">
            <div class="detail-row">
              <span class="detail-label">Nombre completo</span>
              <strong>{{ user()?.name || 'No disponible' }}</strong>
            </div>
            <div class="detail-row">
              <span class="detail-label">Correo electrónico</span>
              <strong>{{ user()?.email || 'No disponible' }}</strong>
            </div>
            <div class="detail-row">
              <span class="detail-label">Rol</span>
              <strong>{{ formatRole(user()?.role) }}</strong>
            </div>
            <div class="detail-row">
              <span class="detail-label">Organización</span>
              <strong>{{ tenant()?.name || 'No disponible' }}</strong>
            </div>
          </div>
        </section>

        <aside class="profile-card access-card">
          <div class="card-heading">
            <p class="section-label">ACCESO</p>
            <h3>Permisos de la cuenta</h3>
            <p>Resumen según el rol asignado actualmente.</p>
          </div>

          <div class="access-summary">
            <span class="access-mark">{{ roleInitial() }}</span>
            <div>
              <strong>{{ formatRole(user()?.role) }}</strong>
              <p>{{ roleDescription() }}</p>
            </div>
          </div>

          <div class="security-note">
            <span class="material-symbols-outlined">lock</span>
            <div>
              <strong>Acceso protegido</strong>
              <p>Tu sesión utiliza autenticación mediante token.</p>
            </div>
          </div>
        </aside>
      </div>

      <section class="profile-card actions-card">
        <div>
          <p class="section-label">ACCIONES DE CUENTA</p>
          <h3>Administrar perfil</h3>
        </div>
        <div class="account-actions">
          <button type="button" class="secondary-button" (click)="openPreferences()">
            <span class="material-symbols-outlined">tune</span>
            Preferencias
          </button>
          <button type="button" class="logout-button" (click)="logout()">
            <span class="material-symbols-outlined">logout</span>
            Cerrar sesión
          </button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display:block; }
    .profile-page { max-width:1120px; margin:0 auto; }
    .page-header { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; margin-bottom:26px; }
    .section-label { color:var(--primary); font:700 10px 'Space Grotesk',sans-serif; letter-spacing:.14em; margin-bottom:7px; }
    .page-description,.card-heading > p:last-child { color:var(--on-surface-variant); opacity:.72; margin-top:6px; font-size:13px; }

    .settings-button,.secondary-button,.logout-button {
      display:flex; align-items:center; justify-content:center; gap:8px; padding:10px 16px;
      border:1px solid var(--outline-variant); border-radius:10px; background:var(--surface-container-lowest);
      color:var(--on-surface); font:600 13px 'Hanken Grotesk',sans-serif; cursor:pointer; transition:.2s;
    }
    .settings-button:hover,.secondary-button:hover { border-color:var(--primary); color:var(--primary); background:rgba(240,80,35,.04); }
    .settings-button .material-symbols-outlined,.secondary-button .material-symbols-outlined,.logout-button .material-symbols-outlined { font-size:18px; }

    .identity-panel {
      display:flex; align-items:center; gap:20px; min-height:150px; padding:26px 28px; margin-bottom:18px;
      border:1px solid var(--outline-variant); border-radius:14px; background:var(--surface-container-lowest);
      position:relative; overflow:hidden;
    }
    .identity-panel::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; background:var(--primary); }
    .profile-avatar {
      width:76px; height:76px; flex-shrink:0; display:grid; place-items:center; border-radius:18px;
      background:rgba(240,80,35,.1); color:var(--primary); border:1px solid rgba(240,80,35,.18);
    }
    .profile-avatar .material-symbols-outlined { font-size:38px; font-variation-settings:'FILL' 1; }
    .identity-copy { flex:1; min-width:0; }
    .identity-copy h3 { font:700 24px 'Space Grotesk',sans-serif; letter-spacing:-.02em; }
    .identity-copy > p { margin-top:4px; color:var(--on-surface-variant); font-size:14px; }
    .identity-tags { display:flex; flex-wrap:wrap; gap:8px; margin-top:13px; }
    .role-tag,.tenant-tag { padding:5px 9px; border-radius:999px; font-size:10px; font-weight:700; }
    .role-tag { background:rgba(240,80,35,.08); color:var(--primary); }
    .tenant-tag { background:var(--surface-container-low); color:var(--on-surface-variant); }
    .session-state { display:flex; align-items:center; gap:7px; padding:7px 11px; border-radius:999px; background:rgba(21,128,61,.08); color:#15803d; font-size:11px; font-weight:700; }
    .state-dot { width:7px; height:7px; border-radius:50%; background:#15803d; }

    .profile-grid { display:grid; grid-template-columns:minmax(0,1.35fr) minmax(300px,.75fr); gap:18px; margin-bottom:18px; }
    .profile-card { border:1px solid var(--outline-variant); border-radius:14px; background:var(--surface-container-lowest); padding:26px; }
    .card-heading { padding-bottom:20px; border-bottom:1px solid var(--outline-variant); }
    .card-heading h3,.actions-card h3 { font:700 17px 'Space Grotesk',sans-serif; }
    .details-list { display:flex; flex-direction:column; }
    .detail-row { display:grid; grid-template-columns:170px minmax(0,1fr); gap:20px; padding:17px 0; border-bottom:1px solid var(--surface-container); }
    .detail-row:last-child { border-bottom:0; padding-bottom:0; }
    .detail-label { color:var(--on-surface-variant); font-size:13px; }
    .detail-row strong { overflow:hidden; text-overflow:ellipsis; font-size:13px; text-align:right; }

    .access-summary { display:flex; align-items:flex-start; gap:13px; padding:20px 0; border-bottom:1px solid var(--outline-variant); }
    .access-mark { width:38px; height:38px; flex-shrink:0; display:grid; place-items:center; border-radius:10px; background:rgba(240,80,35,.09); color:var(--primary); font:700 14px 'Space Grotesk',sans-serif; }
    .access-summary strong,.security-note strong { font-size:13px; }
    .access-summary p,.security-note p { color:var(--on-surface-variant); opacity:.72; font-size:12px; line-height:1.45; margin-top:4px; }
    .security-note { display:flex; align-items:flex-start; gap:12px; padding-top:20px; }
    .security-note .material-symbols-outlined { color:var(--on-surface-variant); font-size:20px; }

    .actions-card { display:flex; align-items:center; justify-content:space-between; gap:20px; }
    .account-actions { display:flex; gap:10px; }
    .logout-button { color:var(--error); border-color:rgba(186,26,26,.2); }
    .logout-button:hover { background:rgba(186,26,26,.05); border-color:var(--error); }

    @media(max-width:850px) { .profile-grid { grid-template-columns:1fr; } }
    @media(max-width:650px) {
      .page-header,.actions-card { align-items:flex-start; flex-direction:column; }
      .identity-panel { align-items:flex-start; flex-wrap:wrap; }
      .session-state { width:max-content; }
      .detail-row { grid-template-columns:1fr; gap:5px; }
      .detail-row strong { text-align:left; }
      .account-actions { width:100%; flex-direction:column; }
      .settings-button,.secondary-button,.logout-button { width:100%; }
    }
  `]
})
export class ProfileComponent {
  private appState = inject(AppStateService);
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.appState.currentUser;
  tenant = this.appState.currentTenant;

  formatRole(role?: string): string {
    const cleanRole = role?.replace('ROLE_', '') || '';
    const roles: Record<string, string> = {
      ADMIN_TENANT: 'Administrador',
      COLABORADOR_RESOLUTOR: 'Resolutor',
      COLABORADOR: 'Colaborador'
    };
    return roles[cleanRole] || 'Usuario';
  }

  roleInitial(): string { return this.formatRole(this.user()?.role).charAt(0); }

  roleDescription(): string {
    const role = this.user()?.role?.replace('ROLE_', '');
    if (role === 'ADMIN_TENANT') return 'Gestiona tickets, áreas, colaboradores y configuración del tenant.';
    if (role === 'COLABORADOR_RESOLUTOR') return 'Gestiona y resuelve los tickets disponibles para el equipo.';
    return 'Crea tickets y consulta el seguimiento de tus propios casos.';
  }

  openProfileSettings() { this.router.navigate(['/app/settings'], { queryParams: { tab: 'profile' } }); }
  openPreferences() { this.router.navigate(['/app/settings'], { queryParams: { tab: 'settings' } }); }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
