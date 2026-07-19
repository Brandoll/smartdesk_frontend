import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../core/services/ticket.service';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Page Header -->
    <header class="page-header">
      <div>
        <h2 class="text-headline-lg" style="letter-spacing:-0.01em">Centro de Operaciones</h2>
        <p class="text-body-md" style="color:var(--on-surface-variant); opacity:0.7; margin-top:4px">
          Monitoreando <strong>{{ filteredTickets().length }}</strong> tickets activos en la infraestructura.
        </p>
      </div>
      <div class="header-actions">
        <div class="tab-group">
          <button class="tab-btn" [class.active]="activeTab() === 'all'" (click)="activeTab.set('all')">Todos</button>
          <button class="tab-btn" [class.active]="activeTab() === 'assigned'" (click)="activeTab.set('assigned')">Asignados</button>
        </div>
        <div style="position:relative;">
          <button class="filter-btn" [class.active]="showFilters()" (click)="showFilters.set(!showFilters())">
            <span class="material-symbols-outlined" style="font-size:18px">tune</span>
            Filtros
            @if (activeFiltersCount() > 0) {
              <span class="filter-badge">{{ activeFiltersCount() }}</span>
            }
          </button>
          
          <!-- Filter Dropdown Panel -->
          @if (showFilters()) {
            <div class="filter-panel premium-card">
              <h4 class="text-headline-md" style="margin-bottom:16px; font-size:14px">Filtros Avanzados</h4>
              
              <div class="filter-section">
                <label class="filter-label">ESTADO</label>
                <select class="filter-select" [ngModel]="filterStatus()" (ngModelChange)="updateFilterStatus($event)">
                  <option value="">Todos los estados</option>
                  <option value="ABIERTO">Abierto</option>
                  <option value="ASIGNADO">Asignado</option>
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="PROPUESTO">Propuesto</option>
                  <option value="RESUELTO">Resuelto</option>
                  <option value="CERRADO">Cerrado</option>
                </select>
              </div>

              <div class="filter-section">
                <label class="filter-label">PRIORIDAD</label>
                <select class="filter-select" [ngModel]="filterPriority()" (ngModelChange)="updateFilterPriority($event)">
                  <option value="">Todas las prioridades</option>
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                  <option value="CRITICA">Crítica</option>
                </select>
              </div>

              <div class="filter-actions">
                <button class="btn-clear" (click)="clearFilters()">Limpiar</button>
                <button class="btn-apply" (click)="showFilters.set(false)">Aplicar</button>
              </div>
            </div>
          }
        </div>
        <button class="create-ticket-btn" (click)="createTicket()">
          <span class="material-symbols-outlined" style="font-size:18px">add</span>
          Nuevo Ticket
        </button>
      </div>
    </header>

    <!-- AI Toggle + Stats -->
    <div class="control-bar">
      <div class="ai-toggle">
        <span class="material-symbols-outlined" style="font-size:18px; font-variation-settings:'FILL' 1">auto_awesome</span>
        <span class="text-label-md">Prioridad IA Optimizada</span>
        <div class="toggle-switch" (click)="aiEnabled.set(!aiEnabled())">
          <div class="toggle-track" [class.on]="aiEnabled()">
            <div class="toggle-thumb"></div>
          </div>
        </div>
      </div>

      <div class="stats-bar">
        @for (stat of statusStats(); track stat.label) {
          <div class="stat-item">
            <span class="stat-dot" [style.background]="stat.color"></span>
            <span class="stat-count">{{ stat.count }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        }
      </div>

      <div class="pagination-info">
        <span class="text-label-sm" style="color:var(--on-surface-variant)">
          @if (filteredTickets().length > 0) {
            1-{{ filteredTickets().length }} de {{ filteredTickets().length }}
          } @else {
            0 resultados
          }
        </span>
        <div class="pagination-btns">
          <button class="page-btn"><span class="material-symbols-outlined">chevron_left</span></button>
          <button class="page-btn"><span class="material-symbols-outlined">chevron_right</span></button>
        </div>
      </div>
    </div>

    <!-- Ticket Table -->
    <div class="premium-card table-card">
      <table class="ticket-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>DETALLES DEL TICKET</th>
            <th>ESTADO</th>
            <th>PRIORIDAD</th>
            <th>ÁREA</th>
            <th>ASIGNADO</th>
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            @for (i of [1,2,3]; track i) {
              <tr class="skeleton-row">
                <td colspan="6"><div class="skeleton-line"></div></td>
              </tr>
            }
          } @else if (filteredTickets().length === 0) {
            <tr>
              <td colspan="6" class="empty-state">
                <span class="material-symbols-outlined" style="font-size:48px; opacity:0.2; margin-bottom:12px">filter_list_off</span>
                <p class="text-body-md" style="opacity:0.5">No hay tickets que coincidan con los filtros</p>
                <button class="create-first-btn" style="background:transparent; color:var(--primary); border:1px solid var(--primary)" (click)="clearFilters()">Limpiar filtros</button>
              </td>
            </tr>
          } @else {
            @for (ticket of filteredTickets(); track ticket.id) {
              <tr class="ticket-row" (click)="viewTicket(ticket.id)">
                <td class="ticket-id">#SD-{{ ticket.id?.toString().substring(0,4) }}</td>
                <td class="ticket-details">
                  <div class="ticket-title-row">
                    <span class="ticket-title">{{ ticket.title }}</span>
                    @if (ticket.aiClassified) {
                      <span class="material-symbols-outlined ai-icon" style="font-size:16px; font-variation-settings:'FILL' 1">auto_awesome</span>
                    }
                  </div>
                  <p class="ticket-desc">{{ ticket.description | slice:0:60 }}{{ ticket.description && ticket.description.length > 60 ? '...' : '' }}</p>
                </td>
                <td>
                  <span class="status-badge" [attr.data-status]="ticket.status">
                    <span class="material-symbols-outlined" style="font-size:14px">{{ getStatusIcon(ticket.status) }}</span>
                    {{ getStatusLabel(ticket.status) }}
                  </span>
                </td>
                <td>
                  <span class="priority-badge" [attr.data-priority]="ticket.priority">
                    <span class="priority-bars">
                      <span class="p-bar"></span><span class="p-bar"></span><span class="p-bar"></span>
                    </span>
                    {{ getPriorityLabel(ticket.priority) }}
                  </span>
                </td>
                <td>
                  @if (ticket.areaName) {
                    <span class="area-tag">{{ ticket.areaName }}</span>
                  } @else {
                    <span style="opacity:0.3">—</span>
                  }
                </td>
                <td>
                  @if (ticket.assignedToName) {
                    <div class="assignee">
                      <div class="assignee-avatar">{{ ticket.assignedToName.charAt(0) }}</div>
                      <span>{{ ticket.assignedToName }}</span>
                    </div>
                  } @else {
                    <span style="opacity:0.3">Sin asignar</span>
                  }
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>

    <!-- Overlay for closing dropdown -->
    @if (showFilters()) {
      <div style="position:fixed;inset:0;z-index:90" (click)="showFilters.set(false)"></div>
    }
  `,
  styles: [`
    :host { display: block; }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .header-actions { display: flex; gap: 12px; align-items: center; }

    .tab-group {
      display: flex;
      background: var(--surface-container-low);
      padding: 3px;
      border-radius: 9999px;
      border: 1px solid var(--outline-variant);
    }

    .tab-btn {
      padding: 8px 24px;
      border: none;
      background: transparent;
      font-family: 'Geist', sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: var(--on-surface-variant);
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab-btn.active {
      background: var(--primary);
      color: var(--on-primary);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .filter-btn {
      position: relative;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 20px;
      border: 1px solid var(--outline-variant);
      background: var(--surface-container-lowest);
      border-radius: 9999px;
      font-family: 'Geist', sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: var(--on-surface);
      cursor: pointer;
      transition: all 0.2s;
      z-index: 100;
    }

    .filter-btn:hover { border-color: var(--primary); }
    .filter-btn.active { background: var(--surface-container-high); }

    .filter-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      background: var(--primary);
      color: var(--on-primary);
      font-size: 10px;
      font-weight: bold;
      border-radius: 50%;
      margin-left: 4px;
    }

    .create-ticket-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 20px;
      background: var(--primary);
      color: var(--on-primary);
      border: none;
      border-radius: 9999px;
      font-family: 'Geist', sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .create-ticket-btn:hover {
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      transform: translateY(-1px);
    }

    .filter-panel {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 280px;
      padding: 20px;
      z-index: 101;
      animation: slideDown 0.2s cubic-bezier(0.16,1,0.3,1);
    }

    .filter-section {
      margin-bottom: 16px;
    }

    .filter-label {
      display: block;
      font-family: 'Geist', sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: var(--on-surface-variant);
      margin-bottom: 6px;
      letter-spacing: 0.05em;
    }

    .filter-select {
      width: 100%;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid var(--outline-variant);
      background: var(--surface-container-lowest);
      color: var(--on-surface);
      font-family: 'Manrope', sans-serif;
      font-size: 13px;
      outline: none;
    }

    .filter-select:focus { border-color: var(--primary); }

    .filter-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--outline-variant);
    }

    .btn-clear {
      padding: 6px 12px;
      background: transparent;
      border: 1px solid var(--outline-variant);
      border-radius: 6px;
      color: var(--on-surface-variant);
      font-family: 'Geist', sans-serif;
      font-size: 12px;
      cursor: pointer;
    }

    .btn-apply {
      padding: 6px 16px;
      background: var(--primary);
      border: none;
      border-radius: 6px;
      color: var(--on-primary);
      font-family: 'Geist', sans-serif;
      font-size: 12px;
      cursor: pointer;
    }

    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

    /* Control Bar */
    .control-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding: 12px 20px;
      background: var(--surface-container-lowest);
      border: 1px solid var(--surface-container);
      border-radius: 1rem;
    }

    .ai-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toggle-switch { cursor: pointer; }
    .toggle-track {
      width: 44px;
      height: 24px;
      background: var(--surface-container-highest);
      border-radius: 12px;
      position: relative;
      transition: background 0.2s;
    }
    .toggle-track.on { background: var(--primary); }
    .toggle-thumb {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 18px;
      height: 18px;
      background: white;
      border-radius: 9px;
      transition: transform 0.2s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .toggle-track.on .toggle-thumb { transform: translateX(20px); }

    .stats-bar { display: flex; gap: 20px; }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .stat-dot { width: 8px; height: 8px; border-radius: 9999px; }
    .stat-count {
      font-family: 'Geist', sans-serif;
      font-size: 14px;
      font-weight: 600;
    }
    .stat-label {
      font-family: 'Geist', sans-serif;
      font-size: 14px;
      color: var(--on-surface-variant);
    }

    .pagination-info { display: flex; align-items: center; gap: 8px; }
    .pagination-btns { display: flex; gap: 4px; }
    .page-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--outline-variant);
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      color: var(--on-surface-variant);
      transition: all 0.2s;
    }
    .page-btn:hover { border-color: var(--primary); color: var(--primary); }

    /* Table */
    .table-card { padding: 0; overflow: hidden; }

    .ticket-table {
      width: 100%;
      border-collapse: collapse;
    }

    .ticket-table th {
      padding: 16px 20px;
      text-align: left;
      font-family: 'Geist', sans-serif;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: var(--on-surface-variant);
      border-bottom: 1px solid var(--surface-container);
    }

    .ticket-row {
      cursor: pointer;
      transition: background 0.15s;
    }

    .ticket-row:hover { background: var(--surface-container-low); }

    .ticket-row td {
      padding: 20px;
      vertical-align: middle;
      border-bottom: 1px solid var(--surface-container);
    }

    .ticket-id {
      font-family: 'Geist', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: var(--on-surface-variant);
      white-space: nowrap;
    }

    .ticket-title-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .ticket-title {
      font-family: 'Geist', sans-serif;
      font-size: 15px;
      font-weight: 600;
      color: var(--on-surface);
    }

    .ai-icon { color: var(--primary); }

    .ticket-desc {
      font-size: 13px;
      color: var(--on-surface-variant);
      opacity: 0.6;
      margin-top: 4px;
    }

    /* Status Badges */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 12px;
      border-radius: 9999px;
      font-family: 'Geist', sans-serif;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .status-badge[data-status="ABIERTO"] { background: var(--surface-container-highest); color: var(--on-surface); }
    .status-badge[data-status="ASIGNADO"] { background: #e8e7f1; color: #474747; }
    .status-badge[data-status="EN_PROCESO"] { background: var(--primary); color: var(--on-primary); }
    .status-badge[data-status="PROPUESTO"] { background: #d0e7ea; color: #364a4d; }
    .status-badge[data-status="RESUELTO"] { background: #c6c6c6; color: #1b1b1b; }
    .status-badge[data-status="CERRADO"] { background: #1b1b1b; color: #ffffff; }

    /* Priority */
    .priority-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: 'Geist', sans-serif;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .priority-bars { display: flex; gap: 2px; }
    .p-bar { width: 4px; height: 12px; background: var(--primary); border-radius: 2px; }
    .priority-badge[data-priority="BAJA"] .p-bar:nth-child(n+2) { opacity: 0.15; }
    .priority-badge[data-priority="MEDIA"] .p-bar:nth-child(3) { opacity: 0.15; }
    .priority-badge[data-priority="CRITICA"] .p-bar { background: var(--error); }

    /* Area Tag */
    .area-tag {
      padding: 4px 12px;
      border: 1px solid var(--outline-variant);
      border-radius: 9999px;
      font-family: 'Geist', sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: var(--on-surface);
    }

    /* Assignee */
    .assignee { display: flex; align-items: center; gap: 8px; }
    .assignee-avatar {
      width: 28px;
      height: 28px;
      border-radius: 9999px;
      background: var(--surface-container-highest);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Geist', sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: var(--on-surface-variant);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 64px 20px !important;
    }

    .create-first-btn {
      margin-top: 16px;
      padding: 10px 24px;
      background: var(--primary);
      color: var(--on-primary);
      border: none;
      border-radius: 9999px;
      font-family: 'Geist', sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .create-first-btn:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.15); }

    .skeleton-row td { padding: 24px 20px !important; }
    .skeleton-line {
      height: 16px;
      background: var(--surface-container);
      border-radius: 8px;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @media (max-width: 1024px) {
      .page-header { flex-direction: column; gap: 16px; }
      .control-bar { flex-wrap: wrap; gap: 12px; }
    }
  `]
})
export class TicketListComponent implements OnInit {
  private ticketService = inject(TicketService);
  private router = inject(Router);

  tickets = signal<any[]>([]);
  loading = signal(true);
  
  // Filter state
  activeTab = signal<'all' | 'assigned'>('all');
  showFilters = signal(false);
  filterStatus = signal<string>('');
  filterPriority = signal<string>('');
  
  aiEnabled = signal(true);

  // Computed properties
  filteredTickets = computed(() => {
    let result = this.tickets();
    
    // Filter by Tab
    if (this.activeTab() === 'assigned') {
      result = result.filter(t => t.assignedToId || t.assignedToName); 
    }

    // Filter by Status
    const status = this.filterStatus();
    if (status) {
      result = result.filter(t => t.status === status);
    }

    // Filter by Priority
    const priority = this.filterPriority();
    if (priority) {
      result = result.filter(t => t.priority === priority);
    }

    return result;
  });

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filterStatus()) count++;
    if (this.filterPriority()) count++;
    return count;
  });

  statusStats = computed(() => {
    const data = this.tickets();
    const criticalCount = data.filter(t => t.priority === 'CRITICA').length;
    const inProgressCount = data.filter(t => t.status === 'EN_PROCESO').length;
    
    return [
      { count: criticalCount, label: 'Críticos', color: 'var(--error)' },
      { count: inProgressCount, label: 'En Progreso', color: 'var(--primary)' }
    ];
  });

  ngOnInit() {
    this.ticketService.getAll().subscribe({
      next: (res: any) => {
        const content = res.content || res || [];
        this.tickets.set(content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  updateFilterStatus(val: string) {
    this.filterStatus.set(val);
  }

  updateFilterPriority(val: string) {
    this.filterPriority.set(val);
  }

  clearFilters() {
    this.filterStatus.set('');
    this.filterPriority.set('');
    this.showFilters.set(false);
  }

  createTicket() {
    this.router.navigate(['/app/tickets/new']);
  }

  viewTicket(id: string) {
    this.router.navigate(['/app/tickets', id]);
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'ABIERTO': 'radio_button_checked',
      'ASIGNADO': 'assignment_ind',
      'EN_PROCESO': 'sync',
      'PROPUESTO': 'lightbulb',
      'RESUELTO': 'check_circle',
      'CERRADO': 'lock'
    };
    return icons[status] || 'circle';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ABIERTO': 'Abierto',
      'ASIGNADO': 'Asignado',
      'EN_PROCESO': 'En Proceso',
      'PROPUESTO': 'Propuesto',
      'RESUELTO': 'Resuelto',
      'CERRADO': 'Cerrado'
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      'BAJA': 'Baja',
      'MEDIA': 'Media',
      'ALTA': 'Alta',
      'CRITICA': 'Crítica'
    };
    return labels[priority] || priority;
  }
}
