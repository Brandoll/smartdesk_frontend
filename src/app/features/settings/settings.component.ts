import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AreaService, AreaDTO } from '../../core/services/area.service';
import { NotificationService } from '../../core/services/notification.service';
import { AppStateService } from '../../core/state/app-state.service';
import { UserService } from '../../core/services/user.service';
import { TicketDTO, TicketService } from '../../core/services/ticket.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { AudioNotificationService } from '../../core/services/audio-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Page Header & Tabs -->
    <header class="page-header">
      <div>
        <h2 class="text-headline-lg" style="letter-spacing:-0.01em">Configuración</h2>
        <p class="text-body-md" style="color:var(--on-surface-variant); opacity:0.7; margin-top:4px">
          Gestiona tus preferencias, perfil y configuración del sistema.
        </p>
      </div>
      
      <div class="tabs-container">
        <div class="tab-group">
          <button class="tab-btn" [class.active]="activeTab() === 'areas'" (click)="setTab('areas')">
            <span class="material-symbols-outlined">domain</span>
            Áreas
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'profile'" (click)="setTab('profile')">
            <span class="material-symbols-outlined">person</span>
            Mi Perfil
          </button>
          <button class="tab-btn" [class.active]="activeTab() === 'settings'" (click)="setTab('settings')">
            <span class="material-symbols-outlined">settings</span>
            Ajustes
          </button>
        </div>
      </div>
    </header>

    <!-- CONTENT: AREAS -->
    @if (activeTab() === 'areas') {
      <div class="tab-content fade-in">
        <div class="section-header">
          <div>
            <p class="section-label">ESTRUCTURA DE SOPORTE</p>
            <h3 class="text-headline-md">Áreas y carga operativa</h3>
            <p class="section-description">Información calculada con los tickets visibles en este momento.</p>
          </div>
          @if (isAdmin()) {
            <button class="add-area-btn" (click)="isAreaModalOpen.set(true)">Añadir área</button>
          }
        </div>

        <div class="area-summary">
          <div><span>Áreas configuradas</span><strong>{{ areas().length }}</strong></div>
          <div><span>Tickets activos</span><strong>{{ activeTickets() }}</strong></div>
          <div><span>Sin área asignada</span><strong>{{ ticketsWithoutArea() }}</strong></div>
        </div>

        @if (loadingAreas() || loadingTickets()) {
          <div class="area-directory loading-directory"></div>
        } @else if (areas().length === 0) {
          <div class="empty-state-card">
            <h3>No hay áreas configuradas</h3>
            <p>Crea un área para organizar responsables y tickets.</p>
          </div>
        } @else {
          <div class="area-directory">
            <div class="directory-header">
              <span>Área</span><span>Activos</span><span>Resueltos</span><span>Total</span>
            </div>
            @for (area of areas(); track area.id) {
              <div class="directory-row">
                <div class="area-identity">
                  <div><strong>{{ area.name }}</strong><small>{{ area.description || 'Sin descripción' }}</small></div>
                  <span class="active-badge">Activa</span>
                </div>
                <strong class="metric-value emphasis">{{ areaTicketCount(area.id, 'active') }}</strong>
                <strong class="metric-value">{{ areaTicketCount(area.id, 'resolved') }}</strong>
                <strong class="metric-value">{{ areaTicketCount(area.id, 'total') }}</strong>
              </div>
            }
          </div>
        }
      </div>
    }

    <!-- CONTENT: PROFILE -->
    @if (activeTab() === 'profile') {
      <div class="tab-content fade-in">
        <div class="profile-layout">
          <!-- Profile Sidebar -->
          <div class="premium-card profile-sidebar">
            <div class="profile-avatar-large">
              {{ getInitials(appState.currentUser()?.name) }}
            </div>
            <h3 class="profile-name">{{ appState.currentUser()?.name }}</h3>
            <p class="profile-role">{{ formatRole(appState.currentUser()?.role) }}</p>
            <div class="profile-divider"></div>
            <div class="profile-stat-row">
              <span class="material-symbols-outlined">mail</span>
              <span>{{ appState.currentUser()?.email }}</span>
            </div>
            <div class="profile-stat-row">
              <span class="material-symbols-outlined">domain</span>
              <span>{{ appState.currentTenant()?.name || 'SmartDesk' }}</span>
            </div>
            <div class="profile-stat-row">
              <span class="material-symbols-outlined">verified_user</span>
              <span style="color:#22c55e">Cuenta Verificada</span>
            </div>
          </div>

          <!-- Profile Form -->
          <div class="premium-card profile-form-card">
            <h3 class="text-headline-md" style="margin-bottom:24px">Información Personal</h3>
            <form [formGroup]="profileForm" (ngSubmit)="onSubmitProfile()">
              <div class="form-grid">
                <div class="form-group">
                  <label class="text-label-sm form-label">NOMBRE COMPLETO</label>
                  <input type="text" formControlName="name" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="text-label-sm form-label">CORREO ELECTRÓNICO</label>
                  <input type="email" formControlName="email" class="form-input" readonly style="opacity:0.7; cursor:not-allowed" />
                  <p class="text-caption" style="margin-top:4px; opacity:0.5">El correo no puede ser modificado.</p>
                </div>
              </div>

              <div class="form-divider"></div>

              <h3 class="text-headline-md" style="margin-bottom:24px">Seguridad</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label class="text-label-sm form-label">NUEVA CONTRASEÑA</label>
                  <input type="password" formControlName="password" class="form-input" placeholder="••••••••" />
                </div>
                <div class="form-group">
                  <label class="text-label-sm form-label">CONFIRMAR CONTRASEÑA</label>
                  <input type="password" formControlName="confirmPassword" class="form-input" placeholder="••••••••" />
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-primary" [disabled]="profileForm.invalid || savingProfile()">
                  {{ savingProfile() ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- CONTENT: SETTINGS -->
    @if (activeTab() === 'settings') {
      <div class="tab-content fade-in">
        <div class="settings-layout">
          <div class="settings-card">
            <div class="settings-heading">
              <p class="section-label">PREFERENCIAS LOCALES</p>
              <h3 class="text-headline-md">Notificaciones</h3>
              <p>Estas opciones se aplican en este navegador.</p>
            </div>
            <div class="settings-row">
              <div class="settings-info">
                <h4>Sonido de notificaciones</h4>
                <p>Reproduce un aviso cuando llega una actualización en tiempo real.</p>
              </div>
              <button type="button" class="toggle-switch" (click)="audioService.setEnabled(!audioService.enabled())" [attr.aria-pressed]="audioService.enabled()">
                <div class="toggle-track" [class.on]="audioService.enabled()">
                  <div class="toggle-thumb"></div>
                </div>
              </button>
            </div>

            <div class="settings-row">
              <div class="settings-info">
                <h4>Actualizaciones en tiempo real</h4>
                <p>Chat, asignaciones y cambios del ticket se sincronizan durante la sesión.</p>
              </div>
              <span class="connection-status"><span></span>Activo</span>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Area Modal -->
    @if (isAreaModalOpen()) {
      <div class="modal-overlay" (click)="isAreaModalOpen.set(false)">
        <div class="modal-card premium-card" (click)="$event.stopPropagation()">
          <h3 class="text-headline-md" style="margin-bottom:20px">Nueva Área</h3>
          <form [formGroup]="areaForm" (ngSubmit)="onSubmitArea()">
            <div class="form-group">
              <label class="text-label-sm form-label">NOMBRE DEL ÁREA</label>
              <input type="text" formControlName="name" placeholder="Ej. Soporte IT" class="form-input" />
            </div>
            <div class="form-group">
              <label class="text-label-sm form-label">DESCRIPCIÓN</label>
              <textarea formControlName="description" rows="3" placeholder="Funciones del área..." class="form-input" style="resize:vertical"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="isAreaModalOpen.set(false)">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="areaForm.invalid || savingArea()">
                {{ savingArea() ? 'Guardando...' : 'Crear Área' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .fade-in { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .page-header {
      display: flex; flex-direction: column; gap: 24px; margin-bottom: 32px;
    }

    .tabs-container {
      width: 100%; border-bottom: 1px solid var(--outline-variant); padding-bottom: 1px;
    }

    .tab-group {
      display: flex; gap: 32px;
    }

    .tab-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 0; border: none; background: transparent;
      font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 500;
      color: var(--on-surface-variant); cursor: pointer; transition: all 0.2s;
      border-bottom: 2px solid transparent; margin-bottom: -1px;
    }
    
    .tab-btn .material-symbols-outlined { font-size: 18px; }

    .tab-btn:hover { color: var(--on-surface); }
    .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }

    .section-header { display:flex; justify-content:space-between; align-items:flex-end; gap:20px; margin-bottom:24px; }
    .section-label { color:var(--primary); font:700 10px 'Space Grotesk',sans-serif; letter-spacing:.14em; margin-bottom:7px; }
    .section-description { margin-top:5px; color:var(--on-surface-variant); opacity:.7; font-size:13px; }

    .add-area-btn {
      display: flex; align-items: center; gap: 6px; padding: 10px 20px;
      background: var(--primary); color: var(--on-primary); border: none;
      border-radius: 10px; font-family: 'Hanken Grotesk', sans-serif; font-size: 14px;
      font-weight: 500; cursor: pointer; transition: all 0.2s;
    }
    .add-area-btn:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.15); transform: translateY(-1px); }

    .area-summary { display:grid; grid-template-columns:repeat(3,1fr); border:1px solid var(--outline-variant); border-radius:14px; overflow:hidden; background:var(--surface-container-lowest); margin-bottom:18px; }
    .area-summary div { min-height:105px; padding:20px 24px; border-right:1px solid var(--outline-variant); }
    .area-summary div:last-child { border-right:0; }
    .area-summary span { display:block; color:var(--on-surface-variant); font-size:12px; font-weight:600; }
    .area-summary strong { display:block; margin-top:12px; font:700 28px 'Space Grotesk',sans-serif; }
    .area-directory { border:1px solid var(--outline-variant); border-radius:14px; overflow:hidden; background:var(--surface-container-lowest); }
    .directory-header,.directory-row { display:grid; grid-template-columns:minmax(250px,1fr) 90px 90px 70px; align-items:center; gap:18px; }
    .directory-header { padding:11px 20px; background:var(--surface-container-low); color:var(--on-surface-variant); font:700 10px 'Space Grotesk',sans-serif; letter-spacing:.08em; text-transform:uppercase; }
    .directory-row { min-height:78px; padding:14px 20px; border-top:1px solid var(--outline-variant); }
    .area-identity { display:flex; align-items:center; gap:12px; min-width:0; }
    .area-identity div { min-width:0; display:flex; flex-direction:column; gap:4px; }
    .area-identity strong { font:600 14px 'Space Grotesk',sans-serif; }
    .area-identity small { color:var(--on-surface-variant); opacity:.7; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .active-badge { margin-left:auto; padding:4px 8px; border-radius:999px; background:rgba(21,128,61,.08); color:#15803d; font-size:10px; font-weight:700; }
    .metric-value { font:700 14px 'Space Grotesk',sans-serif; color:var(--on-surface-variant); }
    .metric-value.emphasis { color:var(--primary); }
    .loading-directory { min-height:250px; animation:pulse 1.4s infinite; }

    /* Empty State */
    .empty-state-card { padding:64px; text-align:center; border:1px solid var(--outline-variant); border-radius:14px; background:var(--surface-container-lowest); }
    .empty-state-card p { margin-top:6px; color:var(--on-surface-variant); }

    /* Profile Layout */
    .profile-layout { display: grid; grid-template-columns: 320px 1fr; gap: 24px; }
    
    .profile-sidebar { padding: 32px; display: flex; flex-direction: column; align-items: center; text-align: center; }
    .profile-avatar-large {
      width: 100px; height: 100px; border-radius: 50%; background: var(--primary-container);
      color: var(--on-primary-container); display: flex; align-items: center; justify-content: center;
      font-family: 'Geist', sans-serif; font-size: 32px; font-weight: 600; margin-bottom: 16px;
      border: 2px solid var(--outline-variant);
    }
    .profile-name { font-family: 'Geist', sans-serif; font-size: 20px; font-weight: 600; color: var(--on-surface); margin-bottom: 4px; }
    .profile-role { font-family: 'Geist', sans-serif; font-size: 12px; font-weight: 600; color: var(--primary); letter-spacing: 0.05em; }
    .profile-divider { width: 100%; height: 1px; background: var(--outline-variant); margin: 24px 0; }
    .profile-stat-row {
      width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 0;
      font-family: 'Manrope', sans-serif; font-size: 14px; color: var(--on-surface-variant);
      border-bottom: 1px solid var(--surface-container);
    }
    .profile-stat-row .material-symbols-outlined { font-size: 20px; opacity: 0.7; }
    .profile-stat-row:last-child { border-bottom: none; }

    .profile-form-card { padding: 32px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .form-divider { height: 1px; background: var(--surface-container); margin: 32px 0; }
    .form-actions { display: flex; justify-content: flex-end; margin-top: 32px; }

    /* Settings Layout */
    .settings-layout { max-width:860px; }
    .settings-card { padding:28px; border:1px solid var(--outline-variant); border-radius:14px; background:var(--surface-container-lowest); }
    .settings-heading { padding-bottom:20px; border-bottom:1px solid var(--outline-variant); }
    .settings-heading > p:last-child { margin-top:5px; color:var(--on-surface-variant); opacity:.7; font-size:13px; }
    .settings-divider { height: 1px; background: var(--surface-container); margin: 32px 0; }
    .settings-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--surface-container); }
    .settings-row:last-child { border-bottom: none; padding-bottom: 0; }
    .settings-info h4 { font-family: 'Geist', sans-serif; font-size: 15px; font-weight: 600; color: var(--on-surface); margin-bottom: 4px; }
    .settings-info p { font-family: 'Manrope', sans-serif; font-size: 14px; color: var(--on-surface-variant); opacity: 0.7; }
    
    .settings-info p { font-family: 'Manrope', sans-serif; font-size: 14px; color: var(--on-surface-variant); opacity: 0.7; }

    /* Toggles */
    .toggle-switch { padding:0; border:0; background:transparent; cursor:pointer; }
    .toggle-track { width: 44px; height: 24px; background: var(--surface-container-highest); border-radius: 12px; position: relative; transition: background 0.2s; }
    .toggle-track.on { background: var(--primary); }
    .toggle-thumb { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background: white; border-radius: 9px; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
    .toggle-track.on .toggle-thumb { transform:translateX(20px); }
    .connection-status { display:flex; align-items:center; gap:7px; padding:6px 10px; border-radius:999px; background:rgba(21,128,61,.08); color:#15803d; font-size:11px; font-weight:700; }
    .connection-status span { width:7px; height:7px; border-radius:50%; background:#15803d; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal-card { width: 480px; padding: 32px; }
    
    /* Forms Shared */
    .form-group { margin-bottom: 16px; width: 100%; }
    .form-label { display: block; margin-bottom: 6px; color: var(--on-surface-variant); letter-spacing: 0.05em; }
    .form-input {
      width: 100%; padding: 12px 16px;
      background: var(--surface-container-lowest); border: 1px solid var(--outline-variant);
      border-radius: 12px; font-family: 'Manrope', sans-serif; font-size: 14px;
      color: var(--on-surface); outline: none; transition: border-color 0.2s;
    }
    .form-input:focus { border-color: var(--primary); }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary { padding: 10px 24px; border: 1px solid var(--outline-variant); background: transparent; border-radius: 9999px; font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-primary { padding: 10px 24px; background: var(--primary); color: var(--on-primary); border: none; border-radius: 9999px; font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-primary:hover:not(:disabled) { box-shadow: 0 8px 24px rgba(0,0,0,0.15); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    @media (max-width: 1024px) {
      .profile-layout { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .section-header { align-items:flex-start; flex-direction:column; }
      .area-summary { grid-template-columns:1fr; }
      .area-summary div { border-right:0; border-bottom:1px solid var(--outline-variant); }
      .area-summary div:last-child { border-bottom:0; }
      .directory-header { display:none; }
      .directory-row { grid-template-columns:1fr repeat(3,48px); gap:10px; padding:15px; }
      .active-badge { display:none; }
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class SettingsComponent implements OnInit, OnDestroy {
  private areaService = inject(AreaService);
  private userService = inject(UserService);
  private ticketService = inject(TicketService);
  private websocketService = inject(WebsocketService);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public appState = inject(AppStateService);
  public audioService = inject(AudioNotificationService);
  private notificationSub?: Subscription;

  activeTab = signal<'areas' | 'profile' | 'settings'>('areas');

  // Areas State
  areas = signal<AreaDTO[]>([]);
  loadingAreas = signal<boolean>(true);
  tickets = signal<TicketDTO[]>([]);
  loadingTickets = signal<boolean>(true);
  activeTickets = computed(() => this.tickets().filter(ticket => this.isTicketActive(ticket)).length);
  ticketsWithoutArea = computed(() => this.tickets().filter(ticket => this.isTicketActive(ticket) && !ticket.areaId).length);
  isAreaModalOpen = signal<boolean>(false);
  savingArea = signal<boolean>(false);

  areaForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: ['']
  });

  // Profile State
  savingProfile = signal<boolean>(false);
  profileForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: [{value: '', disabled: true}],
    password: [''],
    confirmPassword: ['']
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab.set(params['tab']);
      }
    });

    this.loadAreas();
    this.loadTickets();
    this.initProfileForm();
    this.notificationSub = this.websocketService.getNotifications().subscribe(message => {
      if (message['ticketId']) this.loadTickets(false);
    });
  }

  ngOnDestroy() { this.notificationSub?.unsubscribe(); }

  setTab(tab: 'areas' | 'profile' | 'settings') {
    this.activeTab.set(tab);
    this.router.navigate([], { queryParams: { tab: tab }, queryParamsHandling: 'merge' });
  }

  // --- Profile Logic ---
  initProfileForm() {
    const user = this.appState.currentUser();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email
      });
    }
  }

  onSubmitProfile() {
    if (this.profileForm.invalid) return;
    const formVals = this.profileForm.getRawValue();
    
    if (formVals.password && formVals.password !== formVals.confirmPassword) {
      this.notification.error('Las contraseñas no coinciden');
      return;
    }

    const user = this.appState.currentUser();
    if (!user) return;

    this.savingProfile.set(true);

    const dto = {
      name: formVals.name,
      email: user.email,
      role: user.role
    };

    // Assuming we have an update endpoint for user profile
    this.userService.update(user.id, dto).subscribe({
      next: (updatedUser) => {
        this.savingProfile.set(false);
        this.notification.success('Perfil actualizado correctamente');
        // Update local state
        this.appState.setCurrentUser({
          ...user,
          name: updatedUser.name
        });
        localStorage.setItem('currentUser', JSON.stringify(this.appState.currentUser()));
      },
      error: () => {
        this.savingProfile.set(false);
        this.notification.error('Error al actualizar el perfil');
      }
    });
  }

  // --- Areas Logic ---
  loadAreas() {
    this.loadingAreas.set(true);
    this.areaService.getAll().subscribe({
      next: (data) => {
        this.areas.set(data);
        this.loadingAreas.set(false);
      },
      error: () => {
        this.loadingAreas.set(false);
        this.notification.error('Error cargando áreas');
      }
    });
  }

  loadTickets(showLoading = true) {
    if (showLoading) this.loadingTickets.set(true);
    this.ticketService.getAll(0, 500).subscribe({
      next: response => {
        this.tickets.set(response.content || []);
        this.loadingTickets.set(false);
      },
      error: () => this.loadingTickets.set(false)
    });
  }

  areaTicketCount(areaId: string | undefined, kind: 'active' | 'resolved' | 'total'): number {
    if (!areaId) return 0;
    const tickets = this.tickets().filter(ticket => ticket.areaId === areaId);
    if (kind === 'active') return tickets.filter(ticket => this.isTicketActive(ticket)).length;
    if (kind === 'resolved') return tickets.filter(ticket => ticket.status === 'RESUELTO' || ticket.status === 'CERRADO').length;
    return tickets.length;
  }

  private isTicketActive(ticket: TicketDTO): boolean {
    return ticket.status !== 'RESUELTO' && ticket.status !== 'CERRADO';
  }

  isAdmin(): boolean {
    return this.appState.currentUser()?.role?.replace('ROLE_', '') === 'ADMIN_TENANT';
  }

  getAreaIcon(name: string): string {
    const lower = (name || '').toLowerCase();
    if (lower.includes('it') || lower.includes('tech') || lower.includes('infra')) return 'dns';
    if (lower.includes('rrhh') || lower.includes('human') || lower.includes('recursos')) return 'badge';
    if (lower.includes('finanz') || lower.includes('contab')) return 'account_balance';
    if (lower.includes('opera') || lower.includes('logist')) return 'settings_suggest';
    if (lower.includes('ventas') || lower.includes('sales')) return 'storefront';
    return 'domain';
  }

  onSubmitArea() {
    if (this.areaForm.invalid) return;
    this.savingArea.set(true);
    this.areaService.create(this.areaForm.getRawValue()).subscribe({
      next: (newArea) => {
        this.savingArea.set(false);
        this.isAreaModalOpen.set(false);
        this.areaForm.reset();
        this.areas.update(current => [...current, newArea]);
        this.notification.success('Área creada exitosamente');
      },
      error: () => {
        this.savingArea.set(false);
        this.notification.error('Error al crear el área');
      }
    });
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
