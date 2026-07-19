import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStateService } from '../../core/state/app-state.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">
      <!-- Hero Section -->
      <section class="profile-hero">
        <div class="hero-banner">
          <div class="hero-decoration">
            <div class="decoration-circle-lg"></div>
            <div class="decoration-circle-sm"></div>
          </div>
        </div>
        <div class="profile-identity">
          <div class="avatar-wrapper">
            <div class="avatar-large">{{ getInitials() }}</div>
            <button class="avatar-edit-btn">
              <span class="material-symbols-outlined" style="font-size:16px">edit</span>
            </button>
          </div>
          <div class="profile-info">
            <h2 class="profile-name">{{ user()?.name || 'Usuario' }}</h2>
            <div class="profile-meta">
              <span class="profile-role">
                <span class="material-symbols-outlined" style="font-size:18px">verified</span>
                {{ formatRole(user()?.role) }}
              </span>
              <span class="meta-dot"></span>
              <span>Departamento: Soporte Técnico</span>
            </div>
          </div>
          <button class="btn-edit-profile">Editar Perfil</button>
        </div>
      </section>

      <!-- Grid Content -->
      <div class="profile-grid">
        <!-- Left Column -->
        <div class="left-column">
          <!-- Activity Summary -->
          <div class="profile-card">
            <h3 class="card-title">Activity Summary</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <p class="stat-label">RESOLVED</p>
                <p class="stat-value">1,284</p>
              </div>
              <div class="stat-item">
                <p class="stat-label">ACTIVE</p>
                <p class="stat-value">12</p>
              </div>
            </div>
            <div class="stats-list">
              <div class="stat-row">
                <span class="stat-row-label">Average Response</span>
                <span class="stat-row-value">14m 20s</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-row">
                <span class="stat-row-label">Satisfaction Rate</span>
                <span class="stat-row-value green">98.4%</span>
              </div>
            </div>
          </div>

          <!-- Notifications -->
          <div class="profile-card">
            <div class="card-header">
              <h3 class="card-title">Notifications</h3>
              <span class="material-symbols-outlined" style="color:var(--on-surface-variant)">tune</span>
            </div>
            <div class="notif-list">
              <label class="notif-item">
                <div class="notif-info">
                  <p class="notif-name">Email Notifications</p>
                  <p class="notif-desc">Major updates & ticket alerts</p>
                </div>
                <div class="toggle" [class.on]="emailNotif" (click)="emailNotif = !emailNotif">
                  <div class="toggle-thumb"></div>
                </div>
              </label>
              <label class="notif-item">
                <div class="notif-info">
                  <p class="notif-name">In-app Push</p>
                  <p class="notif-desc">Real-time collaboration cues</p>
                </div>
                <div class="toggle" [class.on]="inAppNotif" (click)="inAppNotif = !inAppNotif">
                  <div class="toggle-thumb"></div>
                </div>
              </label>
              <label class="notif-item">
                <div class="notif-info">
                  <p class="notif-name">SMS Alerts</p>
                  <p class="notif-desc">Emergency escalations only</p>
                </div>
                <div class="toggle" [class.on]="smsNotif" (click)="smsNotif = !smsNotif">
                  <div class="toggle-thumb"></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Personal Information -->
          <div class="profile-card">
            <h3 class="card-title">Personal Information</h3>
            <div class="info-grid">
              <div class="info-field">
                <label class="field-label">EMAIL ADDRESS</label>
                <div class="field-value">
                  <span class="material-symbols-outlined" style="font-size:18px; color:var(--on-surface-variant)">mail</span>
                  <span>{{ user()?.email || 'usuario@smartdesk.ai' }}</span>
                </div>
              </div>
              <div class="info-field">
                <label class="field-label">PHONE NUMBER</label>
                <div class="field-value">
                  <span class="material-symbols-outlined" style="font-size:18px; color:var(--on-surface-variant)">phone</span>
                  <span>+1 (555) 0123-4567</span>
                </div>
              </div>
              <div class="info-field">
                <label class="field-label">LOCATION</label>
                <div class="field-value">
                  <span class="material-symbols-outlined" style="font-size:18px; color:var(--on-surface-variant)">location_on</span>
                  <span>Ciudad de México — Remoto</span>
                </div>
              </div>
              <div class="info-field">
                <label class="field-label">TIMEZONE</label>
                <div class="field-value">
                  <span class="material-symbols-outlined" style="font-size:18px; color:var(--on-surface-variant)">schedule</span>
                  <span>Central Standard Time (CST)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Account & Security -->
          <div class="profile-card">
            <h3 class="card-title">Account & Security</h3>
            <div class="security-list">
              <div class="security-item">
                <div class="security-info">
                  <p class="security-name">Change Password</p>
                  <p class="security-desc">Last updated 3 months ago. Highly recommended to update regularly.</p>
                </div>
                <button class="btn-outline">Update</button>
              </div>
              <div class="security-item">
                <div class="security-info-with-icon">
                  <div class="security-icon">
                    <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">security</span>
                  </div>
                  <div>
                    <p class="security-name">Two-Factor Authentication</p>
                    <p class="security-desc">Add an extra layer of security to your account.</p>
                    <div class="tfa-status">
                      <span class="tfa-dot"></span>
                      <span>ENABLED (AUTHENTICATOR APP)</span>
                    </div>
                  </div>
                </div>
                <button class="btn-outline">Configure</button>
              </div>
            </div>
          </div>

          <!-- Recent Sessions -->
          <div class="profile-card">
            <h3 class="card-title">Recent Sessions</h3>
            <table class="sessions-table">
              <thead>
                <tr>
                  <th>DEVICE</th>
                  <th>LOCATION</th>
                  <th>STATUS</th>
                  <th class="text-right">LAST ACTIVE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>MacBook Pro 16"</td>
                  <td>Ciudad de México, MX</td>
                  <td><span class="session-badge current">Current</span></td>
                  <td class="text-right">Just now</td>
                </tr>
                <tr>
                  <td>iPhone 14 Pro</td>
                  <td>Ciudad de México, MX</td>
                  <td><span class="session-badge idle">Idle</span></td>
                  <td class="text-right">2h ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="profile-footer">
        <p>© 2024 SmartDesk AI Support Engine. All Rights Reserved.</p>
        <div class="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Security Center</a>
          <a href="#">Help Desk</a>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .profile-page {
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Hero */
    .profile-hero { margin-bottom: 32px; }
    .hero-banner {
      height: 160px; border-radius: 16px;
      background: var(--primary, #1b1b1b);
      position: relative; overflow: hidden;
    }
    .hero-decoration { position: absolute; inset: 0; opacity: 0.15; pointer-events: none; }
    .decoration-circle-lg {
      position: absolute; right: -80px; top: -80px;
      width: 320px; height: 320px;
      border: 40px solid white; border-radius: 50%;
    }
    .decoration-circle-sm {
      position: absolute; right: 120px; bottom: -20px;
      width: 80px; height: 80px;
      border: 4px solid white; border-radius: 50%;
    }
    .profile-identity {
      display: flex; align-items: flex-end; gap: 24px;
      padding: 0 24px; margin-top: -56px;
    }
    .avatar-wrapper { position: relative; flex-shrink: 0; }
    .avatar-large {
      width: 112px; height: 112px; border-radius: 16px;
      border: 4px solid var(--surface, #fbf8ff);
      background: var(--surface-container-highest, #e3e1ec);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Geist', sans-serif; font-size: 32px;
      font-weight: 700; color: var(--on-surface, #1a1b22);
    }
    .avatar-edit-btn {
      position: absolute; bottom: 4px; right: 4px;
      background: white; border: 1px solid var(--outline-variant, #cfc4c5);
      border-radius: 50%; width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .profile-info { flex: 1; padding-bottom: 12px; }
    .profile-name {
      font-family: 'Geist', sans-serif; font-size: 32px;
      font-weight: 600; letter-spacing: -0.01em; margin-bottom: 4px;
    }
    .profile-meta {
      display: flex; align-items: center; gap: 12px;
      color: var(--on-surface-variant, #4c4546); font-size: 14px;
    }
    .profile-role { display: flex; align-items: center; gap: 4px; }
    .meta-dot {
      width: 4px; height: 4px; border-radius: 50%;
      background: var(--outline-variant, #cfc4c5);
    }
    .btn-edit-profile {
      padding: 10px 24px; background: var(--primary, #1b1b1b);
      color: white; border: none; border-radius: 9999px;
      font-family: 'Geist', sans-serif; font-size: 13px;
      font-weight: 600; cursor: pointer; margin-bottom: 16px;
      transition: opacity 0.2s;
    }
    .btn-edit-profile:hover { opacity: 0.85; }

    /* Grid */
    .profile-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; }
    .left-column, .right-column { display: flex; flex-direction: column; gap: 24px; }

    /* Card */
    .profile-card {
      background: white; border: 1px solid var(--outline-variant, #cfc4c5);
      border-radius: 16px; padding: 28px;
    }
    .card-title {
      font-family: 'Geist', sans-serif; font-size: 18px;
      font-weight: 600; margin-bottom: 20px;
    }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .card-header .card-title { margin-bottom: 0; }

    /* Stats */
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .stat-item {
      padding: 16px; background: var(--surface-container-low, #f4f2fd);
      border: 1px solid var(--surface-container, #eeedf7); border-radius: 12px;
    }
    .stat-label {
      font-family: 'Geist', sans-serif; font-size: 10px;
      text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--on-surface-variant, #4c4546); margin-bottom: 4px;
    }
    .stat-value {
      font-family: 'Geist', sans-serif; font-size: 28px;
      font-weight: 700; color: var(--primary, #1b1b1b);
    }
    .stats-list { display: flex; flex-direction: column; gap: 12px; }
    .stat-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
    .stat-row-label { color: var(--on-surface-variant, #4c4546); }
    .stat-row-value { font-weight: 700; }
    .stat-row-value.green { color: #16a34a; }
    .stat-divider { height: 1px; background: var(--surface-container, #eeedf7); }

    /* Notifications */
    .notif-list { display: flex; flex-direction: column; gap: 20px; }
    .notif-item { display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
    .notif-info {}
    .notif-name { font-weight: 700; font-size: 14px; }
    .notif-desc { font-size: 11px; color: var(--on-surface-variant, #4c4546); }
    .toggle {
      width: 44px; height: 24px; border-radius: 9999px;
      background: var(--surface-container-highest, #e3e1ec);
      position: relative; transition: background 0.2s; cursor: pointer;
    }
    .toggle.on { background: var(--primary, #1b1b1b); }
    .toggle-thumb {
      width: 18px; height: 18px; border-radius: 50%;
      background: white; position: absolute;
      top: 3px; left: 3px; transition: transform 0.2s;
    }
    .toggle.on .toggle-thumb { transform: translateX(20px); }

    /* Info Grid */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .info-field {}
    .field-label {
      font-family: 'Geist', sans-serif; font-size: 10px;
      text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--on-surface-variant, #4c4546); margin-bottom: 6px; display: block;
    }
    .field-value {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; background: var(--surface-container-low, #f4f2fd);
      border: 1px solid var(--surface-container, #eeedf7); border-radius: 10px;
      font-size: 14px; transition: border-color 0.2s;
    }
    .field-value:hover { border-color: var(--outline, #7e7576); }

    /* Security */
    .security-list { display: flex; flex-direction: column; gap: 16px; }
    .security-item {
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
      padding: 20px; background: var(--surface-container-low, #f4f2fd);
      border: 1px solid var(--surface-container, #eeedf7); border-radius: 12px;
    }
    .security-info-with-icon { display: flex; align-items: flex-start; gap: 16px; }
    .security-icon {
      padding: 8px; background: #d0e7ea; border-radius: 10px;
      color: #364a4d; margin-top: 2px; flex-shrink: 0;
    }
    .security-name { font-weight: 700; font-size: 15px; margin-bottom: 4px; }
    .security-desc { font-size: 13px; color: var(--on-surface-variant, #4c4546); }
    .tfa-status {
      display: flex; align-items: center; gap: 6px;
      margin-top: 6px;
      font-family: 'Geist', sans-serif; font-size: 10px;
      font-weight: 700; letter-spacing: 0.05em;
      color: var(--on-surface-variant, #4c4546);
    }
    .tfa-dot { width: 8px; height: 8px; border-radius: 50%; background: #16a34a; }
    .btn-outline {
      padding: 8px 20px; border: 1px solid var(--outline, #7e7576);
      background: white; border-radius: 9999px;
      font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 600;
      cursor: pointer; white-space: nowrap; transition: background 0.2s;
    }
    .btn-outline:hover { background: var(--surface-container-low, #f4f2fd); }

    /* Sessions Table */
    .sessions-table { width: 100%; text-align: left; border-collapse: collapse; }
    .sessions-table th {
      padding: 10px 8px; font-family: 'Geist', sans-serif; font-size: 11px;
      font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--on-surface-variant, #4c4546);
      border-bottom: 1px solid var(--surface-container, #eeedf7);
    }
    .sessions-table td {
      padding: 14px 8px; font-size: 14px;
      border-bottom: 1px solid var(--surface-container, #eeedf7);
    }
    .sessions-table tr:last-child td { border-bottom: none; }
    .text-right { text-align: right !important; }
    .session-badge {
      padding: 3px 10px; border-radius: 9999px;
      font-family: 'Geist', sans-serif; font-size: 11px; font-weight: 700;
    }
    .session-badge.current { background: #d0e7ea; color: #364a4d; }
    .session-badge.idle { background: var(--surface-container, #eeedf7); color: var(--on-surface-variant, #4c4546); }

    /* Footer */
    .profile-footer {
      margin-top: 40px; padding-top: 24px;
      border-top: 1px solid var(--outline-variant, #cfc4c5);
      display: flex; justify-content: space-between; align-items: center;
      color: var(--on-surface-variant, #4c4546); font-size: 13px;
      padding-bottom: 32px;
    }
    .footer-links { display: flex; gap: 32px; }
    .footer-links a {
      color: var(--on-surface-variant, #4c4546); text-decoration: none;
      font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 500;
    }
    .footer-links a:hover { color: var(--primary, #1b1b1b); }

    @media (max-width: 1024px) {
      .profile-grid { grid-template-columns: 1fr; }
      .profile-identity { flex-wrap: wrap; }
      .info-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ProfileComponent {
  private appState = inject(AppStateService);
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.appState.currentUser;

  emailNotif = true;
  inAppNotif = true;
  smsNotif = false;

  getInitials(): string {
    const name = this.user()?.name || 'U';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  }

  formatRole(role?: string): string {
    const roles: Record<string, string> = {
      'ADMIN': 'Senior Support Admin',
      'SUPER_ADMIN': 'Super Administrador',
      'AGENT': 'Agente de Soporte',
      'USER': 'Usuario Estándar'
    };
    return roles[role || ''] || role || 'Usuario';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
