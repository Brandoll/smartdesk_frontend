import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardMetrics } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="page-header">
      <div>
        <p class="section-label">OPERACIÓN GENERAL</p>
        <h2 class="text-headline-lg">Resumen de soporte</h2>
        <p class="page-description">Estado actual de los tickets, equipos y prioridades.</p>
      </div>
      <button class="refresh-button" (click)="loadMetrics()" [disabled]="loading()">
        <span class="material-symbols-outlined refresh-icon" [class.loading]="loading()">refresh</span>
        {{ loading() ? 'Actualizando' : 'Actualizar datos' }}
      </button>
    </header>

    @if (loading()) {
      <div class="summary-shell loading-shell"></div>
      <div class="content-grid"><div class="panel loading-panel"></div><div class="panel loading-panel"></div></div>
    } @else if (metrics()) {
      <section class="summary-shell">
        <div class="summary-item primary-summary">
          <span class="summary-label">Backlog activo</span>
          <strong>{{ metrics()!.activeTickets }}</strong>
          <small>{{ activeShare() }}% del total</small>
        </div>
        <div class="summary-item">
          <span class="summary-label">Casos críticos</span>
          <strong>{{ metrics()!.criticalTickets }}</strong>
          <small>Prioridad inmediata</small>
        </div>
        <div class="summary-item">
          <span class="summary-label">Sin asignar</span>
          <strong>{{ metrics()!.unassignedTickets }}</strong>
          <small>Esperando responsable</small>
        </div>
        <div class="summary-item">
          <span class="summary-label">Resolución</span>
          <strong>{{ metrics()!.resolutionRate | number:'1.0-1' }}%</strong>
          <small>{{ metrics()!.resolvedTickets }} casos resueltos</small>
        </div>
      </section>

      <div class="content-grid">
        <section class="panel status-panel">
          <div class="panel-heading">
            <div><p class="section-label">FLUJO DE TRABAJO</p><h3>Tickets por estado</h3></div>
            <span class="count-pill">{{ metrics()!.totalTickets }} en total</span>
          </div>
          <div class="status-list">
            @for (status of statusRows(); track status.key) {
              <div class="status-item">
                <div class="status-title">
                  <span class="status-marker" [class.active]="status.active"></span>
                  <span>{{ status.label }}</span>
                </div>
                <div class="progress-track"><div class="progress-value" [class.active]="status.active" [style.width.%]="status.percentage"></div></div>
                <strong>{{ status.count }}</strong>
                <span class="percentage">{{ status.percentage }}%</span>
              </div>
            }
          </div>
        </section>

        <aside class="panel focus-panel">
          <div class="panel-heading"><div><p class="section-label">ENFOQUE DEL EQUIPO</p><h3>Atención requerida</h3></div></div>
          <div class="focus-list">
            <div class="focus-row">
              <div><strong>Tickets críticos</strong><span>Casos activos de máxima prioridad</span></div>
              <b class="value-pill urgent">{{ metrics()!.criticalTickets }}</b>
            </div>
            <div class="focus-row">
              <div><strong>Sin responsable</strong><span>Casos pendientes de asignación</span></div>
              <b class="value-pill">{{ metrics()!.unassignedTickets }}</b>
            </div>
            <div class="focus-row">
              <div><strong>Tiempo de resolución</strong><span>Promedio de los casos resueltos</span></div>
              <b class="value-pill wide">{{ resolutionTimeLabel() }}</b>
            </div>
          </div>
          <div class="team-summary">
            <div><strong>{{ metrics()!.totalUsers }}</strong><span>Colaboradores</span></div>
            <div><strong>{{ metrics()!.totalAreas }}</strong><span>Áreas</span></div>
          </div>
        </aside>
      </div>

      <div class="lower-grid">
        <section class="panel priority-panel">
          <div class="panel-heading"><div><p class="section-label">COMPOSICIÓN</p><h3>Prioridad de los casos</h3></div></div>
          <div class="priority-list">
            @for (priority of priorityRows(); track priority.key) {
              <div class="priority-row" [class.critical]="priority.key === 'CRITICA'">
                <span>{{ priority.label }}</span>
                <div class="priority-meta"><strong>{{ priority.count }}</strong><small>{{ priority.percentage }}%</small></div>
              </div>
            }
          </div>
        </section>

        <section class="panel area-panel">
          <div class="panel-heading">
            <div><p class="section-label">DISTRIBUCIÓN</p><h3>Carga activa por área</h3></div>
            <span class="count-pill">{{ metrics()!.totalAreas }} áreas</span>
          </div>
          @if (metrics()!.areaWorkload.length === 0) {
            <p class="empty-state">No hay tickets activos en este momento.</p>
          } @else {
            <div class="area-list">
              @for (area of metrics()!.areaWorkload; track area.name; let index = $index) {
                <div class="area-row">
                  <span class="area-index">{{ (index + 1).toString().padStart(2, '0') }}</span>
                  <span class="area-name">{{ area.name }}</span>
                  <div class="area-track"><div class="area-value" [style.width.%]="areaPercentage(area.count)"></div></div>
                  <strong>{{ area.count }}</strong>
                </div>
              }
            </div>
          }
        </section>
      </div>
    } @else {
      <div class="panel error-state">No se pudieron cargar las métricas.<button (click)="loadMetrics()">Reintentar</button></div>
    }
  `,
  styles: [`
    :host { display:block; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:28px; }
    .section-label { color:var(--primary); font-family:'Space Grotesk',sans-serif; font-size:10px; font-weight:700; letter-spacing:.15em; margin-bottom:7px; }
    .page-description { color:var(--on-surface-variant); opacity:.72; margin-top:6px; }
    .refresh-button { display:flex; align-items:center; gap:9px; padding:10px 16px; border:1px solid var(--outline-variant); border-radius:10px; background:var(--surface-container-lowest); color:var(--on-surface); font:600 13px 'Hanken Grotesk',sans-serif; cursor:pointer; transition:.2s; }
    .refresh-button:hover { border-color:var(--primary); color:var(--primary); background:rgba(240,80,35,.04); }
    .refresh-button:disabled { opacity:.55; cursor:default; }
    .refresh-icon { font-size:18px; transition:transform .2s; }
    .refresh-button:hover:not(:disabled) .refresh-icon { transform:rotate(35deg); }
    .refresh-icon.loading { animation:spin .75s linear infinite; } @keyframes spin { to { transform:rotate(360deg); } }

    .summary-shell { display:grid; grid-template-columns:repeat(4,1fr); background:var(--surface-container-lowest); border:1px solid var(--outline-variant); border-radius:14px; overflow:hidden; margin-bottom:18px; }
    .summary-item { min-height:150px; padding:24px 26px; border-right:1px solid var(--outline-variant); position:relative; }
    .summary-item:last-child { border-right:0; }
    .summary-item.primary-summary { background:rgba(240,80,35,.035); }
    .summary-item.primary-summary::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--primary); }
    .summary-label { display:block; color:var(--on-surface-variant); font-size:13px; font-weight:600; }
    .summary-item strong { display:block; margin:19px 0 5px; font:700 38px 'Space Grotesk',sans-serif; letter-spacing:-.04em; }
    .summary-item small { color:var(--on-surface-variant); opacity:.7; font-size:12px; }

    .content-grid { display:grid; grid-template-columns:minmax(0,1.55fr) minmax(310px,.8fr); gap:18px; margin-bottom:18px; }
    .lower-grid { display:grid; grid-template-columns:minmax(290px,.65fr) minmax(0,1.35fr); gap:18px; }
    .panel { background:var(--surface-container-lowest); border:1px solid var(--outline-variant); border-radius:14px; padding:26px; }
    .panel-heading { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; }
    .panel-heading h3 { font:700 17px 'Space Grotesk',sans-serif; color:var(--on-surface); }
    .count-pill,.value-pill { padding:5px 10px; border-radius:999px; background:var(--surface-container); color:var(--on-surface-variant); font-size:11px; font-weight:700; }

    .status-list { display:flex; flex-direction:column; }
    .status-item { display:grid; grid-template-columns:125px 1fr 30px 38px; align-items:center; gap:14px; padding:13px 8px; border-bottom:1px solid var(--surface-container); }
    .status-item:last-child { border-bottom:0; }
    .status-title { display:flex; align-items:center; gap:9px; font-size:13px; font-weight:600; }
    .status-marker { width:7px; height:7px; border-radius:2px; background:var(--outline-variant); }
    .status-marker.active { background:var(--primary); }
    .progress-track,.area-track { height:5px; background:var(--surface-container); border-radius:999px; overflow:hidden; }
    .progress-value { height:100%; background:var(--outline); opacity:.55; border-radius:inherit; }
    .progress-value.active { background:var(--primary); opacity:1; }
    .status-item > strong { font:700 14px 'Space Grotesk'; text-align:right; }
    .percentage { color:var(--on-surface-variant); opacity:.6; font-size:11px; text-align:right; }

    .focus-list { border-top:1px solid var(--outline-variant); }
    .focus-row { display:flex; align-items:center; justify-content:space-between; gap:15px; padding:17px 0; border-bottom:1px solid var(--outline-variant); }
    .focus-row div { display:flex; flex-direction:column; gap:4px; }
    .focus-row strong { font-size:13px; } .focus-row span { color:var(--on-surface-variant); opacity:.7; font-size:11px; }
    .value-pill { flex-shrink:0; font:700 13px 'Space Grotesk'; }
    .value-pill.urgent { background:rgba(186,26,26,.08); color:var(--error); }
    .value-pill.wide { min-width:66px; text-align:center; }
    .team-summary { display:grid; grid-template-columns:1fr 1fr; margin-top:22px; background:var(--surface-container-low); border-radius:10px; }
    .team-summary div { display:flex; flex-direction:column; padding:16px; border-right:1px solid var(--outline-variant); }
    .team-summary div:last-child { border:0; } .team-summary strong { font:700 20px 'Space Grotesk'; } .team-summary span { color:var(--on-surface-variant); font-size:11px; margin-top:3px; }

    .priority-list { display:flex; flex-direction:column; gap:8px; }
    .priority-row { display:flex; align-items:center; justify-content:space-between; padding:13px 14px; border-radius:9px; background:var(--surface-container-low); }
    .priority-row > span { font-size:13px; font-weight:600; }
    .priority-row.critical { background:rgba(240,80,35,.07); color:var(--primary); }
    .priority-meta { display:flex; align-items:baseline; gap:7px; } .priority-meta strong { font:700 16px 'Space Grotesk'; } .priority-meta small { opacity:.55; font-size:10px; }

    .area-list { display:flex; flex-direction:column; }
    .area-row { display:grid; grid-template-columns:30px minmax(100px,150px) 1fr 30px; align-items:center; gap:12px; padding:12px 4px; border-bottom:1px solid var(--surface-container); }
    .area-row:last-child { border-bottom:0; }
    .area-index { font:600 10px 'Space Grotesk'; color:var(--on-surface-variant); opacity:.5; }
    .area-name { font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .area-value { height:100%; border-radius:inherit; background:var(--primary); }
    .area-row strong { font:700 13px 'Space Grotesk'; text-align:right; }
    .empty-state,.error-state { color:var(--on-surface-variant); text-align:center; padding:36px; }
    .error-state button { border:0; background:none; color:var(--primary); font-weight:700; cursor:pointer; margin-left:6px; }
    .loading-shell,.loading-panel { min-height:150px; animation:pulse 1.4s infinite; } .loading-panel { min-height:330px; } @keyframes pulse { 50% { opacity:.45; } }

    @media(max-width:1050px) { .summary-shell { grid-template-columns:repeat(2,1fr); } .summary-item:nth-child(2) { border-right:0; } .summary-item:nth-child(-n+2) { border-bottom:1px solid var(--outline-variant); } .content-grid,.lower-grid { grid-template-columns:1fr; } }
    @media(max-width:650px) { .page-header { align-items:flex-start; flex-direction:column; gap:16px; } .summary-shell { grid-template-columns:1fr; } .summary-item { border-right:0; border-bottom:1px solid var(--outline-variant); } .summary-item:last-child { border-bottom:0; } .status-item { grid-template-columns:105px 1fr 28px; } .status-item .percentage { display:none; } .area-row { grid-template-columns:26px 105px 1fr 25px; } }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  metrics = signal<DashboardMetrics | null>(null);
  loading = signal(true);
  activeShare = computed(() => this.percentage(this.metrics()?.activeTickets || 0));

  statusRows = computed(() => {
    const values = this.metrics()?.ticketsByStatus || {};
    const definitions = [
      ['ABIERTO', 'Abiertos', true], ['ASIGNADO', 'Asignados', true],
      ['EN_PROCESO', 'En proceso', true], ['PROPUESTO', 'Propuestos', true],
      ['RESUELTO', 'Resueltos', false], ['CERRADO', 'Cerrados', false]
    ] as const;
    return definitions.map(([key, label, active]) => ({ key, label, active, count: values[key] || 0, percentage: this.percentage(values[key] || 0) }));
  });

  priorityRows = computed(() => {
    const values = this.metrics()?.ticketsByPriority || {};
    const definitions = [['BAJA','Baja'],['MEDIA','Media'],['ALTA','Alta'],['CRITICA','Crítica']] as const;
    return definitions.map(([key,label]) => ({ key, label, count: values[key] || 0, percentage: this.percentage(values[key] || 0) }));
  });

  ngOnInit() { this.loadMetrics(); }
  loadMetrics() { this.loading.set(true); this.dashboardService.getMetrics().subscribe({ next:data => { this.metrics.set(data); this.loading.set(false); }, error:() => { this.metrics.set(null); this.loading.set(false); } }); }
  percentage(value:number) { const total=this.metrics()?.totalTickets || 0; return total ? Math.round(value*100/total) : 0; }
  areaPercentage(value:number) { const max=Math.max(...(this.metrics()?.areaWorkload || []).map(area=>area.count),1); return Math.round(value*100/max); }
  resolutionTimeLabel() { const hours=this.metrics()?.averageResolutionHours || 0; return hours<1 ? '< 1 h' : hours<24 ? `${hours} h` : `${(hours/24).toFixed(1)} días`; }
}
