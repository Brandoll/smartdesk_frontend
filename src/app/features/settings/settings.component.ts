import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AreaService, AreaDTO } from '../../core/services/area.service';
import { NotificationService } from '../../core/services/notification.service';
import { AppStateService } from '../../core/state/app-state.service';
import { UserService } from '../../core/services/user.service';

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
          <h3 class="text-headline-md">Gestión de Áreas</h3>
          <button class="add-area-btn" (click)="isAreaModalOpen.set(true)">
            <span class="material-symbols-outlined" style="font-size:18px">add</span>
            Añadir Nueva Área
          </button>
        </div>

        @if (loadingAreas()) {
          <div class="areas-grid">
            @for (i of [1,2,3]; track i) {
              <div class="premium-card area-card skeleton-pulse"></div>
            }
          </div>
        } @else if (areas().length === 0) {
          <div class="empty-state-card premium-card">
            <span class="material-symbols-outlined" style="font-size:64px; opacity:0.15; margin-bottom:16px">domain</span>
            <h3 class="text-headline-md" style="opacity:0.6; margin-bottom:8px">Sin áreas configuradas</h3>
            <p class="text-body-md" style="color:var(--on-surface-variant); opacity:0.5; margin-bottom:20px">
              Crea tu primera área para empezar a organizar los tickets.
            </p>
            <button class="add-area-btn" (click)="isAreaModalOpen.set(true)">
              <span class="material-symbols-outlined" style="font-size:18px">add</span>
              Crear Primera Área
            </button>
          </div>
        } @else {
          <div class="areas-grid">
            @for (area of areas(); track area.id) {
              <div class="premium-card area-card">
                <div class="area-card-top">
                  <div class="area-icon-box">
                    <span class="material-symbols-outlined">{{ getAreaIcon(area.name) }}</span>
                  </div>
                  <span class="area-status-badge">ACTIVA</span>
                </div>
                <h3 class="area-name">{{ area.name }}</h3>
                <p class="area-desc">{{ area.description || 'Sin descripción' }}</p>
                <div class="area-meta">
                  <div class="area-meta-row">
                    <span>Líder de Área</span>
                    <span class="area-meta-val">—</span>
                  </div>
                  <div class="area-meta-row">
                    <span>Tickets Activos</span>
                    <span class="area-meta-val">0</span>
                  </div>
                </div>
                <div class="area-ai-bar">
                  <div class="area-ai-label">
                    <span>Precisión IA</span>
                    <span class="area-ai-pct">—</span>
                  </div>
                  <div class="area-ai-track">
                    <div class="area-ai-fill" style="width:0%"></div>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Global Logic Mapping Card -->
        <div class="logic-card" style="margin-top:24px">
          <div class="logic-card-inner">
            <span class="material-symbols-outlined" style="font-size:28px; font-variation-settings:'FILL' 1; color:white; opacity:0.8">settings_suggest</span>
            <h3 class="logic-title">Mapeo de Lógica Global</h3>
            <p class="logic-desc">Define el núcleo de inteligencia. Usa mapeo semántico para enrutar tickets automáticamente basado en detección de intención y clustering de palabras clave.</p>
            <div class="logic-tags">
              <div class="logic-tag-group">
                <span class="logic-tag-label">FOCO DE KEYWORDS</span>
                <div class="logic-tag-list">
                  <span class="logic-tag">SERVIDOR_CAIDO</span>
                  <span class="logic-tag">ERROR_VPN</span>
                  <span class="logic-tag">CONSULTA_NÓMINA</span>
                </div>
              </div>
              <div class="logic-tag-group">
                <span class="logic-tag-label">CLASIFICADORES DE INTENCIÓN</span>
                <div class="logic-tag-list" style="flex-direction:column; gap:4px">
                  <span style="color:rgba(255,255,255,0.7); font-size:14px">✓ Soporte Técnico Urgente</span>
                  <span style="color:rgba(255,255,255,0.7); font-size:14px">✓ Solicitud de Documentos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
          <div class="premium-card settings-card">
            <h3 class="text-headline-md" style="margin-bottom:24px">Apariencia</h3>
            
            <div class="settings-row">
              <div class="settings-info">
                <h4>Tema de la Interfaz</h4>
                <p>Cambia entre el modo claro y oscuro.</p>
              </div>
              <div class="theme-toggles">
                <button class="theme-btn" [class.active]="appState.theme() === 'light'" (click)="appState.setTheme('light')">
                  <span class="material-symbols-outlined">light_mode</span>
                  Claro
                </button>
                <button class="theme-btn" [class.active]="appState.theme() === 'dark'" (click)="appState.setTheme('dark')">
                  <span class="material-symbols-outlined">dark_mode</span>
                  Oscuro
                </button>
              </div>
            </div>

            <div class="settings-divider"></div>

            <h3 class="text-headline-md" style="margin-bottom:24px">Notificaciones</h3>
            
            <div class="settings-row">
              <div class="settings-info">
                <h4>Notificaciones por Email</h4>
                <p>Recibir correos cuando se asigna un ticket.</p>
              </div>
              <div class="toggle-switch">
                <div class="toggle-track on">
                  <div class="toggle-thumb" style="transform: translateX(20px)"></div>
                </div>
              </div>
            </div>

            <div class="settings-row">
              <div class="settings-info">
                <h4>Notificaciones Push</h4>
                <p>Alertas en el navegador en tiempo real.</p>
              </div>
              <div class="toggle-switch">
                <div class="toggle-track on">
                  <div class="toggle-thumb" style="transform: translateX(20px)"></div>
                </div>
              </div>
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

    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }

    .add-area-btn {
      display: flex; align-items: center; gap: 6px; padding: 10px 20px;
      background: var(--primary); color: var(--on-primary); border: none;
      border-radius: 9999px; font-family: 'Geist', sans-serif; font-size: 14px;
      font-weight: 500; cursor: pointer; transition: all 0.2s;
    }
    .add-area-btn:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.15); transform: translateY(-1px); }

    /* Areas Styles */
    .areas-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .area-card { padding: 28px; }
    .area-card.skeleton-pulse { height: 280px; animation: pulse 1.5s infinite; }

    .area-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .area-icon-box {
      width: 44px; height: 44px; border-radius: 12px;
      background: var(--surface-container-low); display: flex; align-items: center; justify-content: center;
      color: var(--on-surface-variant);
    }
    .area-status-badge {
      padding: 3px 10px; border-radius: 9999px; background: #d0e7ea; color: #364a4d;
      font-family: 'Geist', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.05em;
    }

    .area-name { font-family: 'Geist', sans-serif; font-size: 20px; font-weight: 600; margin-bottom: 6px; }
    .area-desc {
      font-family: 'Manrope', sans-serif; font-size: 14px; color: var(--on-surface-variant);
      opacity: 0.7; margin-bottom: 20px; line-height: 1.5;
    }

    .area-meta { margin-bottom: 20px; }
    .area-meta-row { display: flex; justify-content: space-between; padding: 8px 0; font-family: 'Manrope', sans-serif; font-size: 14px; color: var(--on-surface-variant); }
    .area-meta-val { font-family: 'Geist', sans-serif; font-weight: 600; color: var(--on-surface); }

    .area-ai-bar { border-top: 1px solid var(--surface-container); padding-top: 16px; }
    .area-ai-label { display: flex; justify-content: space-between; margin-bottom: 8px; font-family: 'Manrope', sans-serif; font-size: 14px; color: var(--on-surface-variant); }
    .area-ai-pct { font-family: 'Geist', sans-serif; font-weight: 600; color: var(--on-surface); }
    .area-ai-track { height: 4px; background: var(--surface-container-low); border-radius: 9999px; overflow: hidden; }
    .area-ai-fill { height: 100%; background: #2dd4bf; border-radius: 9999px; transition: width 1s ease; }

    /* Logic Card */
    .logic-card { background: var(--primary-container); border-radius: 1rem; overflow: hidden; }
    .logic-card-inner { padding: 32px; }
    .logic-title { font-family: 'Geist', sans-serif; font-size: 24px; font-weight: 600; color: white; margin: 12px 0 8px; }
    .logic-desc { font-family: 'Manrope', sans-serif; font-size: 15px; line-height: 1.6; color: rgba(255,255,255,0.6); margin-bottom: 24px; }
    .logic-tags { display: flex; gap: 32px; }
    .logic-tag-group { flex: 1; }
    .logic-tag-label { font-family: 'Geist', sans-serif; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4); letter-spacing: 0.08em; display: block; margin-bottom: 10px; }
    .logic-tag-list { display: flex; flex-wrap: wrap; gap: 6px; }
    .logic-tag { padding: 4px 12px; border-radius: 6px; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); font-family: 'Geist', sans-serif; font-size: 12px; font-weight: 500; }

    /* Empty State */
    .empty-state-card { padding: 64px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }

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
    .settings-layout { max-width: 800px; }
    .settings-card { padding: 32px; }
    .settings-divider { height: 1px; background: var(--surface-container); margin: 32px 0; }
    .settings-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--surface-container); }
    .settings-row:last-child { border-bottom: none; padding-bottom: 0; }
    .settings-info h4 { font-family: 'Geist', sans-serif; font-size: 15px; font-weight: 600; color: var(--on-surface); margin-bottom: 4px; }
    .settings-info p { font-family: 'Manrope', sans-serif; font-size: 14px; color: var(--on-surface-variant); opacity: 0.7; }
    
    .theme-toggles { display: flex; background: var(--surface-container-low); padding: 4px; border-radius: 12px; border: 1px solid var(--outline-variant); }
    .theme-btn {
      display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: none; background: transparent;
      border-radius: 8px; font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 500;
      color: var(--on-surface-variant); cursor: pointer; transition: all 0.2s;
    }
    .theme-btn.active { background: var(--surface); color: var(--on-surface); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .theme-btn .material-symbols-outlined { font-size: 18px; }

    /* Toggles */
    .toggle-switch { cursor: pointer; }
    .toggle-track { width: 44px; height: 24px; background: var(--surface-container-highest); border-radius: 12px; position: relative; transition: background 0.2s; }
    .toggle-track.on { background: var(--primary); }
    .toggle-thumb { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background: white; border-radius: 9px; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }

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
      .areas-grid { grid-template-columns: repeat(2, 1fr); }
      .profile-layout { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .areas-grid { grid-template-columns: 1fr; }
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class SettingsComponent implements OnInit {
  private areaService = inject(AreaService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public appState = inject(AppStateService);

  activeTab = signal<'areas' | 'profile' | 'settings'>('areas');

  // Areas State
  areas = signal<AreaDTO[]>([]);
  loadingAreas = signal<boolean>(true);
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
    this.initProfileForm();
  }

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
