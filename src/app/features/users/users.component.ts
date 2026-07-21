import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserDTO, UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { AreaDTO, AreaService } from '../../core/services/area.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Page Header -->
    <header class="page-header">
      <div>
        <h2 class="text-headline-lg" style="letter-spacing:-0.01em">Colaboradores</h2>
        <p class="text-body-md" style="color:var(--on-surface-variant); opacity:0.7; margin-top:4px">
          Gestiona accesos, roles y actividad del equipo.
        </p>
      </div>
      <div class="header-actions">
        <div class="tab-group">
          <button class="tab-btn active">Todos</button>
          <button class="tab-btn">Solo Admin</button>
        </div>
        <button class="invite-btn" (click)="showInviteModal = true">
          <span class="material-symbols-outlined" style="font-size:18px">person_add</span>
          Invitar Colaborador
        </button>
      </div>
    </header>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="premium-card stat-card">
        <span class="text-label-sm stat-card-label">TOTAL COLABORADORES</span>
        <p class="stat-card-value">{{ users().length }} <span class="stat-card-sub">/ 50</span></p>
      </div>
      <div class="premium-card stat-card">
        <span class="text-label-sm stat-card-label">ACTIVOS AHORA</span>
        <p class="stat-card-value">{{ getCountByStatus('ACTIVO') }} <span class="stat-card-dot active"></span></p>
      </div>
      <div class="premium-card stat-card">
        <span class="text-label-sm stat-card-label">INVITADOS</span>
        <p class="stat-card-value">{{ getCountByStatus('INVITADO') }}</p>
      </div>
      <div class="premium-card stat-card">
        <span class="text-label-sm stat-card-label">SUSPENDIDOS</span>
        <p class="stat-card-value">{{ getCountByStatus('SUSPENDIDO') }}</p>
      </div>
    </div>

    <!-- Users Table -->
    <div class="premium-card table-card" style="overflow:visible;">
      <div style="overflow-x:auto;">
        <table class="users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Áreas asignadas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @if (loading()) {
              @for (i of [1,2,3]; track i) {
                <tr><td colspan="5"><div class="skeleton-line"></div></td></tr>
              }
            } @else if (filteredUsers().length === 0) {
              <tr>
                <td colspan="5" class="empty-state">
                  <span class="material-symbols-outlined" style="font-size:48px; opacity:0.2; margin-bottom:12px">group</span>
                  <p class="text-body-md" style="opacity:0.5">No se encontraron usuarios</p>
                </td>
              </tr>
            } @else {
              @for (user of filteredUsers(); track user.id) {
                <tr class="user-row" [class.focused-resource]="focusedUserId === user.id?.toString()" [attr.id]="'user-' + user.id">
                  <td>
                    <div class="user-info">
                      <div class="user-avatar">{{ getInitials(user.name) }}</div>
                      <div>
                        <p class="user-name">{{ user.name }}</p>
                        <p class="user-email">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="role-badge" [attr.data-role]="user.role">{{ getRoleLabel(user.role) }}</span>
                  </td>
                  <td>
                    <span class="status-dot" [attr.data-status]="user.status"></span>
                    <span class="status-text">{{ user.status }}</span>
                  </td>
                  <td class="activity-text">{{ getAreaLabels(user.areaIds) }}</td>
                  <td>
                    <div class="user-actions">
                      <button class="action-btn" (click)="openEditModal(user)" title="Administrar colaborador">
                        <span class="material-symbols-outlined">more_horiz</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
      @if (filteredUsers().length > 0) {
        <div class="table-footer">
          <span class="text-label-sm" style="color:var(--on-surface-variant)">
            Mostrando 1 a {{ filteredUsers().length }} de {{ filteredUsers().length }} miembros
          </span>
          <div class="pagination-btns">
            <button class="page-btn"><span class="material-symbols-outlined">chevron_left</span></button>
            <button class="page-btn"><span class="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>
      }
    </div>

    <!-- Roles Info Cards -->
    <div class="roles-grid">
      <div class="premium-card role-info-card">
        <h4 class="text-headline-md" style="margin-bottom:8px">Acceso Admin</h4>
        <p class="text-body-md" style="color:var(--on-surface-variant); opacity:0.7; margin-bottom:16px">
          Control total del sistema incluyendo configuración y seguridad.
        </p>
        <div class="role-perm"><span class="material-symbols-outlined perm-yes">check_circle</span> Gestionar todos los tickets</div>
        <div class="role-perm"><span class="material-symbols-outlined perm-yes">check_circle</span> Invitar nuevos miembros</div>
        <div class="role-perm"><span class="material-symbols-outlined perm-yes">check_circle</span> Acceso a reportes</div>
      </div>
      <div class="premium-card role-info-card">
        <h4 class="text-headline-md" style="margin-bottom:8px">Acceso Resolutor</h4>
        <p class="text-body-md" style="color:var(--on-surface-variant); opacity:0.7; margin-bottom:16px">
          Acceso operativo enfocado en resolución de tickets.
        </p>
        <div class="role-perm"><span class="material-symbols-outlined perm-yes">check_circle</span> Resolver tickets asignados</div>
        <div class="role-perm"><span class="material-symbols-outlined perm-yes">check_circle</span> Ver rendimiento de área</div>
        <div class="role-perm"><span class="material-symbols-outlined perm-no">cancel</span> No puede gestionar usuarios</div>
      </div>
      <div class="premium-card role-info-card">
        <h4 class="text-headline-md" style="margin-bottom:8px">Acceso Colaborador</h4>
        <p class="text-body-md" style="color:var(--on-surface-variant); opacity:0.7; margin-bottom:16px">
          Acceso básico para creación y seguimiento de tickets.
        </p>
        <div class="role-perm"><span class="material-symbols-outlined perm-yes">check_circle</span> Crear y ver tickets propios</div>
        <div class="role-perm"><span class="material-symbols-outlined perm-no">cancel</span> No puede editar datos</div>
        <div class="role-perm"><span class="material-symbols-outlined perm-no">cancel</span> No puede interactuar con otros</div>
      </div>
    </div>

    <!-- Invite Modal -->
    @if (showInviteModal) {
      <div class="modal-overlay" (click)="showInviteModal = false">
        <div class="modal-card premium-card" (click)="$event.stopPropagation()">
          <h3 class="text-headline-md" style="margin-bottom:20px">Invitar Colaborador</h3>
          <div class="form-group">
            <label class="text-label-sm form-label">NOMBRE</label>
            <input type="text" [(ngModel)]="newUser.name" placeholder="Nombre completo" class="form-input" />
          </div>
          <div class="form-group">
            <label class="text-label-sm form-label">EMAIL</label>
            <input type="email" [(ngModel)]="newUser.email" placeholder="correo@empresa.com" class="form-input" />
          </div>
          <div class="form-group">
            <label class="text-label-sm form-label">CONTRASEÑA TEMPORAL</label>
            <div class="password-row">
              <input type="text" [(ngModel)]="newUser.password" placeholder="Mín. 8 caract., 1 mayús., 1 núm., 1 símb." class="form-input" />
              <button type="button" class="generate-password-btn" (click)="generateTemporaryPassword()" title="Generar contraseña segura">
                <span class="material-symbols-outlined">autorenew</span> Generar
              </button>
            </div>
            <small class="password-help">Esta contraseña se enviará al colaborador por correo.</small>
          </div>
          <div class="form-group">
            <label class="text-label-sm form-label">ROL</label>
            <select [(ngModel)]="newUser.role" class="form-input">
              <option value="ADMIN_TENANT">Administrador</option>
              <option value="COLABORADOR_RESOLUTOR">Resolutor</option>
              <option value="COLABORADOR">Colaborador</option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="showInviteModal = false">Cancelar</button>
            <button class="btn-primary" (click)="inviteUser()">Enviar Invitación</button>
          </div>
        </div>
      </div>
    }

    @if (editingUser()) {
      <div class="modal-overlay" (click)="closeEditModal()">
        <div class="modal-card edit-user-modal" (click)="$event.stopPropagation()">
          <div class="edit-modal-header">
            <div>
              <p class="modal-eyebrow">ADMINISTRAR COLABORADOR</p>
              <h3>Información de la cuenta</h3>
            </div>
            <button type="button" class="modal-close" (click)="closeEditModal()">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="edit-user-summary">
            <div class="user-avatar large">{{ getInitials(editingUser()!.name) }}</div>
            <div><strong>{{ editingUser()!.name }}</strong><span>{{ editingUser()!.email }}</span></div>
          </div>

          <div class="edit-form-grid">
            <div class="form-group full-width">
              <label class="text-label-sm form-label">NOMBRE COMPLETO</label>
              <input type="text" [(ngModel)]="editForm.name" class="form-input" />
            </div>
            <div class="form-group full-width">
              <label class="text-label-sm form-label">CORREO ELECTRÓNICO</label>
              <input type="email" [value]="editForm.email" class="form-input readonly-input" readonly />
              <small class="field-help">El correo no puede modificarse desde esta operación.</small>
            </div>
            <div class="form-group">
              <label class="text-label-sm form-label">ROL</label>
              <select [(ngModel)]="editForm.role" class="form-input">
                <option value="ADMIN_TENANT">Administrador</option>
                <option value="COLABORADOR_RESOLUTOR">Resolutor</option>
                <option value="COLABORADOR">Colaborador</option>
              </select>
            </div>
            <div class="form-group">
              <label class="text-label-sm form-label">ESTADO</label>
              <select [(ngModel)]="editForm.status" class="form-input">
                <option value="ACTIVO">Activo</option>
                <option value="INVITADO">Invitado</option>
                <option value="SUSPENDIDO">Suspendido</option>
              </select>
            </div>
          </div>

          <div class="areas-editor">
            <div class="areas-editor-heading">
              <strong>Áreas asignadas</strong>
              <span>{{ editForm.areaIds.length }} seleccionadas</span>
            </div>
            @if (areas().length === 0) {
              <p class="no-areas">No hay áreas configuradas.</p>
            } @else {
              <div class="area-options">
                @for (area of areas(); track area.id) {
                  <label class="area-option" [class.selected]="isAreaSelected(area.id)">
                    <input type="checkbox" [checked]="isAreaSelected(area.id)" (change)="toggleArea(area.id)" />
                    <span>{{ area.name }}</span>
                    <span class="material-symbols-outlined">check</span>
                  </label>
                }
              </div>
            }
          </div>

          <div class="modal-actions edit-actions">
            <button type="button" class="btn-secondary" (click)="closeEditModal()">Cancelar</button>
            <button type="button" class="btn-primary" (click)="saveUserChanges()" [disabled]="savingUser() || !editForm.name.trim()">
              {{ savingUser() ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </div>
      </div>
    }

  `,
  styles: [`
    :host { display: block; }

    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px;
    }
    .header-actions { display: flex; gap: 12px; align-items: center; }
    .tab-group {
      display: flex; background: var(--surface-container-low); padding: 3px;
      border-radius: 9999px; border: 1px solid var(--outline-variant);
    }
    .tab-btn {
      padding: 8px 24px; border: none; background: transparent;
      font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 500;
      color: var(--on-surface-variant); border-radius: 9999px; cursor: pointer; transition: all 0.2s;
    }
    .tab-btn.active { background: var(--primary); color: var(--on-primary); }

    .invite-btn {
      display: flex; align-items: center; gap: 6px; padding: 10px 20px;
      background: var(--primary); color: var(--on-primary); border: none;
      border-radius: 9999px; font-family: 'Geist', sans-serif; font-size: 14px;
      font-weight: 500; cursor: pointer; transition: all 0.2s;
    }
    .invite-btn:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.15); transform: translateY(-1px); }

    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { padding: 24px; }
    .stat-card-label { color: var(--on-surface-variant); text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-card-value {
      font-family: 'Geist', sans-serif; font-size: 32px; font-weight: 600; margin-top: 8px;
    }
    .stat-card-sub { font-size: 16px; opacity: 0.3; }
    .stat-card-dot {
      display: inline-block; width: 8px; height: 8px; border-radius: 9999px; margin-left: 4px;
    }
    .stat-card-dot.active { background: #22c55e; }

    .table-card { padding: 0; margin-bottom: 24px; }
    .users-table { width: 100%; border-collapse: collapse; min-width: 800px; }
    .users-table th {
      padding: 16px 20px; text-align: left;
      font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 500;
      color: var(--on-surface-variant); border-bottom: 1px solid var(--surface-container);
    }
    .user-row { transition: background 0.15s; }
    .user-row:hover { background: var(--surface-container-low); }
    .user-row.focused-resource { background:rgba(240,80,35,.06); box-shadow:inset 3px 0 0 var(--primary); }
    .user-row td { padding: 16px 20px; vertical-align: middle; border-bottom: 1px solid var(--surface-container); }

    .user-info { display: flex; align-items: center; gap: 12px; }
    .user-avatar {
      width: 40px; height: 40px; border-radius: 9999px;
      background: var(--surface-container-high); display: flex; align-items: center; justify-content: center;
      font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 600; color: var(--on-surface-variant);
    }
    .user-name { font-family: 'Geist', sans-serif; font-size: 15px; font-weight: 600; }
    .user-email { font-size: 13px; color: var(--on-surface-variant); opacity: 0.6; }

    .role-badge {
      padding: 4px 12px; border-radius: 6px;
      font-family: 'Geist', sans-serif; font-size: 12px; font-weight: 600;
    }
    .role-badge[data-role="ADMIN_TENANT"] { background: var(--primary); color: var(--on-primary); }
    .role-badge[data-role="COLABORADOR_RESOLUTOR"] { background: #22c55e; color: white; }
    .role-badge[data-role="COLABORADOR"] { background: var(--surface-container-highest); color: var(--on-surface); }

    .status-dot {
      display: inline-block; width: 8px; height: 8px; border-radius: 9999px; margin-right: 6px;
    }
    .status-dot[data-status="ACTIVO"] { background: #22c55e; }
    .status-dot[data-status="INVITADO"] { background: #f59e0b; }
    .status-dot[data-status="SUSPENDIDO"] { background: var(--error); }
    .status-text { font-family: 'Geist', sans-serif; font-size: 14px; }
    .activity-text { font-size: 14px; color: var(--on-surface-variant); }

    .action-btn {
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
      border: none; background: transparent; color: var(--on-surface-variant); border-radius: 8px;
      cursor: pointer; transition: all 0.2s;
    }
    .action-btn:hover { background: var(--surface-container); }
    .user-actions { display:inline-flex; position:relative; }

    .table-footer {
      display: flex; justify-content: space-between; align-items: center; padding: 16px 20px;
      border-top: 1px solid var(--surface-container);
    }
    .pagination-btns { display: flex; gap: 4px; }
    .page-btn {
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--outline-variant); background: transparent; border-radius: 8px;
      cursor: pointer; color: var(--on-surface-variant); transition: all 0.2s;
    }

    .roles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .role-info-card { padding: 24px; }
    .role-perm {
      display: flex; align-items: center; gap: 8px; padding: 6px 0;
      font-family: 'Manrope', sans-serif; font-size: 14px;
    }
    .perm-yes { color: #22c55e; font-size: 18px; }
    .perm-no { color: var(--error); font-size: 18px; }

    .empty-state { text-align: center; padding: 64px 20px !important; }
    .skeleton-line { height: 16px; background: var(--surface-container); border-radius: 8px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; z-index: 100;
    }
    .modal-card { width: 480px; padding: 32px; }
    .edit-user-modal { width:min(620px,calc(100vw - 32px)); max-height:calc(100vh - 32px); overflow-y:auto; padding:0; border:1px solid var(--outline-variant); border-radius:16px; background:var(--surface-container-lowest); }
    .edit-modal-header { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; padding:24px 26px; border-bottom:1px solid var(--outline-variant); }
    .edit-modal-header h3 { font:700 19px 'Space Grotesk',sans-serif; }
    .modal-eyebrow { color:var(--primary); font:700 9px 'Space Grotesk',sans-serif; letter-spacing:.13em; margin-bottom:6px; }
    .modal-close { width:34px; height:34px; display:grid; place-items:center; border:0; border-radius:999px; background:transparent; color:var(--on-surface-variant); cursor:pointer; }
    .modal-close:hover { background:var(--surface-container-low); }
    .modal-close .material-symbols-outlined { font-size:20px; }
    .edit-user-summary { display:flex; align-items:center; gap:13px; padding:18px 26px; background:var(--surface-container-low); border-bottom:1px solid var(--outline-variant); }
    .user-avatar.large { width:46px; height:46px; background:rgba(240,80,35,.1); color:var(--primary); border:1px solid rgba(240,80,35,.18); }
    .edit-user-summary div:last-child { display:flex; flex-direction:column; gap:3px; }
    .edit-user-summary strong { font:600 14px 'Space Grotesk',sans-serif; }
    .edit-user-summary span { color:var(--on-surface-variant); font-size:12px; }
    .edit-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:0 16px; padding:24px 26px 4px; }
    .full-width { grid-column:1/-1; }
    .readonly-input { background:var(--surface-container-low); opacity:.72; cursor:not-allowed; }
    .field-help { display:block; margin-top:5px; color:var(--on-surface-variant); opacity:.65; font-size:11px; }
    .areas-editor { margin:0 26px; padding:18px 0 22px; border-top:1px solid var(--outline-variant); }
    .areas-editor-heading { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
    .areas-editor-heading strong { font:600 13px 'Space Grotesk',sans-serif; }
    .areas-editor-heading span { color:var(--on-surface-variant); font-size:11px; }
    .area-options { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
    .area-option { display:grid; grid-template-columns:18px 1fr 18px; align-items:center; gap:8px; padding:10px 12px; border:1px solid var(--outline-variant); border-radius:9px; cursor:pointer; font-size:12px; }
    .area-option input { position:absolute; opacity:0; pointer-events:none; }
    .area-option::before { content:''; width:14px; height:14px; border:1px solid var(--outline-variant); border-radius:4px; }
    .area-option .material-symbols-outlined { font-size:16px; color:transparent; }
    .area-option.selected { border-color:rgba(240,80,35,.35); background:rgba(240,80,35,.05); color:var(--primary); }
    .area-option.selected::before { background:var(--primary); border-color:var(--primary); }
    .area-option.selected .material-symbols-outlined { color:var(--primary); }
    .no-areas { padding:14px; background:var(--surface-container-low); border-radius:9px; color:var(--on-surface-variant); text-align:center; font-size:12px; }
    .edit-actions { padding:18px 26px; margin:0; border-top:1px solid var(--outline-variant); }
    .form-group { margin-bottom: 16px; }
    .form-label { display: block; margin-bottom: 6px; color: var(--on-surface-variant); letter-spacing: 0.05em; }
    .form-input {
      width: 100%; padding: 12px 16px;
      background: var(--surface-container-lowest); border: 1px solid var(--outline-variant);
      border-radius: 12px; font-family: 'Manrope', sans-serif; font-size: 14px;
      color: var(--on-surface); outline: none; transition: border-color 0.2s;
    }
    .form-input:focus { border-color: var(--primary); }
    .password-row { display: flex; gap: 8px; align-items: stretch; }
    .password-row .form-input { flex: 1; min-width: 0; }
    .generate-password-btn {
      display: flex; align-items: center; gap: 6px; padding: 0 14px;
      border: 1px solid var(--outline-variant); border-radius: 12px;
      background: var(--surface-container-low); color: var(--on-surface);
      font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer;
    }
    .generate-password-btn:hover { border-color: var(--primary); color: var(--primary); }
    .generate-password-btn .material-symbols-outlined { font-size: 18px; }
    .password-help { display: block; margin-top: 6px; color: var(--on-surface-variant); opacity: .7; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-secondary {
      padding: 10px 24px; border: 1px solid var(--outline-variant); background: transparent;
      border-radius: 9999px; font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 500;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-primary {
      padding: 10px 24px; background: var(--primary); color: var(--on-primary); border: none;
      border-radius: 9999px; font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 500;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-primary:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.15); }

    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .roles-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; gap: 16px; }
    }
    @media (max-width: 640px) {
      .edit-form-grid,.area-options { grid-template-columns:1fr; }
      .full-width { grid-column:auto; }
    }
  `]
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private areaService = inject(AreaService);

  users = signal<UserDTO[]>([]);
  areas = signal<AreaDTO[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  focusedUserId = '';
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLocaleLowerCase('es');
    if (!term) return this.users();
    return this.users().filter(user => [user.name, user.email, user.role, user.status]
      .some(value => String(value || '').toLocaleLowerCase('es').includes(term)));
  });
  showInviteModal = false;
  newUser = { name: '', email: '', role: 'COLABORADOR', password: '' };
  editingUser = signal<UserDTO | null>(null);
  savingUser = signal(false);
  editForm = { name: '', email: '', role: 'COLABORADOR', status: 'ACTIVO', areaIds: [] as string[] };

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.searchTerm.set(params.get('search') || '');
      this.focusedUserId = params.get('focus') || '';
      this.scrollToFocusedUser();
    });
    this.loadUsers();
    this.areaService.getAll().subscribe({ next: areas => this.areas.set(areas) });
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (data: any) => {
        this.users.set(Array.isArray(data) ? data : data.content || []);
        this.loading.set(false);
        this.scrollToFocusedUser();
      },
      error: () => this.loading.set(false)
    });
  }

  private scrollToFocusedUser() {
    if (!this.focusedUserId) return;
    setTimeout(() => document.getElementById(`user-${this.focusedUserId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'ADMIN_TENANT': 'Admin',
      'COLABORADOR_RESOLUTOR': 'Resolutor',
      'COLABORADOR': 'Colaborador'
    };
    return labels[role] || role;
  }

  getCountByStatus(status: string): number {
    return this.users().filter(u => u.status === status).length;
  }

  inviteUser() {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.password) {
      this.notification.error('Todos los campos son requeridos');
      return;
    }
    this.userService.create({
      name: this.newUser.name,
      email: this.newUser.email,
      role: this.newUser.role
    }, this.newUser.password).subscribe({
      next: () => {
        this.showInviteModal = false;
        this.newUser = { name: '', email: '', role: 'COLABORADOR', password: '' };
        this.loadUsers();
        this.notification.success('Colaborador invitado exitosamente');
      },
      error: () => {
        this.notification.error('Error al invitar colaborador');
      }
    });
  }

  generateTemporaryPassword() {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%*-_+';
    const all = upper + lower + numbers + symbols;
    const randomChar = (chars: string) => {
      const value = new Uint32Array(1);
      crypto.getRandomValues(value);
      return chars[value[0] % chars.length];
    };

    const password = [randomChar(upper), randomChar(lower), randomChar(numbers), randomChar(symbols)];
    while (password.length < 14) password.push(randomChar(all));
    for (let i = password.length - 1; i > 0; i--) {
      const value = new Uint32Array(1);
      crypto.getRandomValues(value);
      const j = value[0] % (i + 1);
      [password[i], password[j]] = [password[j], password[i]];
    }
    this.newUser.password = password.join('');
  }

  openEditModal(user: UserDTO) {
    this.editingUser.set(user);
    this.editForm = {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || 'ACTIVO',
      areaIds: [...(user.areaIds || [])]
    };
  }

  closeEditModal() {
    if (this.savingUser()) return;
    this.editingUser.set(null);
  }

  isAreaSelected(areaId?: string): boolean {
    return !!areaId && this.editForm.areaIds.includes(areaId);
  }

  toggleArea(areaId?: string) {
    if (!areaId) return;
    this.editForm.areaIds = this.isAreaSelected(areaId)
      ? this.editForm.areaIds.filter(id => id !== areaId)
      : [...this.editForm.areaIds, areaId];
  }

  getAreaLabels(areaIds?: string[]): string {
    if (!areaIds?.length) return 'Sin áreas';
    const names = areaIds.map(id => this.areas().find(area => area.id === id)?.name).filter(Boolean);
    return names.length ? names.join(', ') : `${areaIds.length} área${areaIds.length === 1 ? '' : 's'}`;
  }

  saveUserChanges() {
    const current = this.editingUser();
    if (!current?.id || !this.editForm.name.trim()) return;
    this.savingUser.set(true);
    const update: UserDTO = {
      ...current,
      name: this.editForm.name.trim(),
      email: current.email,
      role: this.editForm.role,
      status: this.editForm.status,
      areaIds: this.editForm.areaIds
    };
    this.userService.update(current.id, update).subscribe({
      next: updated => {
        this.users.update(users => users.map(user => user.id === updated.id ? updated : user));
        this.savingUser.set(false);
        this.editingUser.set(null);
        this.notification.success('Colaborador actualizado correctamente');
      },
      error: () => {
        this.savingUser.set(false);
        this.notification.error('No se pudo actualizar el colaborador');
      }
    });
  }
}
