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
        <div class="eyebrow">CENTRO DE OPERACIONES</div>
        <h2 class="text-headline-lg">Resumen de soporte</h2>
        <p class="subtitle">Situación actual del servicio basada en datos reales.</p>
      </div>
      <button class="refresh-btn" (click)="loadMetrics()" [disabled]="loading()">
        <span class="material-symbols-outlined" [class.spinning]="loading()">refresh</span>
        Actualizar
      </button>
    </header>

    @if (loading()) {
      <div class="kpi-grid">
        @for (item of [1,2,3,4]; track item) { <div class="premium-card kpi-card skeleton"></div> }
      </div>
    } @else if (metrics()) {
      <section class="kpi-grid">
        <article class="premium-card kpi-card accent-orange">
          <div class="kpi-heading"><span class="material-symbols-outlined">inbox</span><span>BACKLOG ACTIVO</span></div>
          <strong>{{ metrics()!.activeTickets }}</strong>
          <p>{{ activeShare() }}% del total de tickets</p>
        </article>
        <article class="premium-card kpi-card accent-red">
          <div class="kpi-heading"><span class="material-symbols-outlined">crisis_alert</span><span>CRÍTICOS ABIERTOS</span></div>
          <strong>{{ metrics()!.criticalTickets }}</strong>
          <p>{{ metrics()!.highPriorityTickets }} casos de prioridad alta o crítica</p>
        </article>
        <article class="premium-card kpi-card accent-amber">
          <div class="kpi-heading"><span class="material-symbols-outlined">person_off</span><span>SIN ASIGNAR</span></div>
          <strong>{{ metrics()!.unassignedTickets }}</strong>
          <p>Requieren responsable</p>
        </article>
        <article class="premium-card kpi-card accent-green">
          <div class="kpi-heading"><span class="material-symbols-outlined">task_alt</span><span>TASA DE RESOLUCIÓN</span></div>
          <strong>{{ metrics()!.resolutionRate | number:'1.0-1' }}%</strong>
          <p>{{ metrics()!.resolvedTickets }} de {{ metrics()!.totalTickets }} tickets resueltos</p>
        </article>
      </section>

      <section class="dashboard-grid">
        <article class="premium-card panel status-panel">
          <div class="panel-header">
            <div><h3>Estado de la operación</h3><p>Distribución actual de todos los casos</p></div>
            <span class="total-pill">{{ metrics()!.totalTickets }} tickets</span>
          </div>
          <div class="status-list">
            @for (status of statusRows(); track status.key) {
              <div class="status-row">
                <div class="status-name"><span class="status-dot" [style.background]="status.color"></span>{{ status.label }}</div>
                <div class="status-track"><div class="status-fill" [style.width.%]="status.percentage" [style.background]="status.color"></div></div>
                <strong>{{ status.count }}</strong>
              </div>
            }
          </div>
        </article>

        <article class="premium-card panel attention-panel">
          <div class="panel-header"><div><h3>Atención requerida</h3><p>Señales para actuar ahora</p></div></div>
          <div class="attention-list">
            <div class="attention-item danger"><span class="material-symbols-outlined">priority_high</span><div><strong>{{ metrics()!.criticalTickets }} críticos</strong><p>Casos activos con máxima prioridad</p></div></div>
            <div class="attention-item warning"><span class="material-symbols-outlined">assignment_late</span><div><strong>{{ metrics()!.unassignedTickets }} sin asignar</strong><p>Necesitan un resolutor responsable</p></div></div>
            <div class="attention-item neutral"><span class="material-symbols-outlined">schedule</span><div><strong>{{ resolutionTimeLabel() }}</strong><p>Tiempo promedio de resolución</p></div></div>
          </div>
        </article>

        <article class="premium-card panel priority-panel">
          <div class="panel-header"><div><h3>Prioridad de los casos</h3><p>Composición del volumen total</p></div></div>
          <div class="priority-grid">
            @for (priority of priorityRows(); track priority.key) {
              <div class="priority-item" [attr.data-priority]="priority.key">
                <span>{{ priority.label }}</span><strong>{{ priority.count }}</strong><small>{{ priority.percentage }}%</small>
              </div>
            }
          </div>
        </article>

        <article class="premium-card panel area-panel">
          <div class="panel-header"><div><h3>Carga activa por área</h3><p>Backlog pendiente de cada equipo</p></div><span class="total-pill">{{ metrics()!.totalAreas }} áreas</span></div>
          @if (metrics()!.areaWorkload.length === 0) {
            <div class="empty-state">No hay tickets activos.</div>
          } @else {
            <div class="area-list">
              @for (area of metrics()!.areaWorkload; track area.name) {
                <div class="area-row"><span>{{ area.name }}</span><div class="area-track"><div class="area-fill" [style.width.%]="areaPercentage(area.count)"></div></div><strong>{{ area.count }}</strong></div>
              }
            </div>
          }
        </article>
      </section>

      <section class="capacity-strip premium-card">
        <div><span class="material-symbols-outlined">groups</span><strong>{{ metrics()!.totalUsers }}</strong><small>colaboradores</small></div>
        <div><span class="material-symbols-outlined">domain</span><strong>{{ metrics()!.totalAreas }}</strong><small>áreas configuradas</small></div>
        <div><span class="material-symbols-outlined">confirmation_number</span><strong>{{ metrics()!.totalTickets }}</strong><small>tickets históricos</small></div>
      </section>
    } @else {
      <div class="premium-card error-state">No se pudieron cargar las métricas. <button (click)="loadMetrics()">Reintentar</button></div>
    }
  `,
  styles: [`
    :host { display:block; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:28px; }
    .eyebrow { color:var(--primary); font:700 11px 'Space Grotesk',sans-serif; letter-spacing:.16em; margin-bottom:8px; }
    .subtitle,.panel-header p { color:var(--on-surface-variant); opacity:.72; margin-top:5px; }
    .refresh-btn { display:flex; align-items:center; gap:8px; padding:10px 16px; border:1px solid var(--outline-variant); border-radius:999px; background:var(--surface-container-lowest); cursor:pointer; font-weight:600; }
    .refresh-btn:disabled { opacity:.55; }
    .spinning { animation:spin .8s linear infinite; } @keyframes spin { to { transform:rotate(360deg); } }
    .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-bottom:18px; }
    .kpi-card { padding:24px; min-height:164px; position:relative; overflow:hidden; }
    .kpi-card::after { content:''; position:absolute; inset:0 auto 0 0; width:4px; background:var(--accent); }
    .accent-orange { --accent:#f05023; } .accent-red { --accent:#ba1a1a; } .accent-amber { --accent:#d97706; } .accent-green { --accent:#15803d; }
    .kpi-heading { display:flex; align-items:center; gap:8px; color:var(--on-surface-variant); font:700 11px 'Space Grotesk',sans-serif; letter-spacing:.09em; }
    .kpi-heading .material-symbols-outlined { color:var(--accent); font-size:20px; }
    .kpi-card strong { display:block; font:700 42px 'Space Grotesk',sans-serif; margin:22px 0 5px; }
    .kpi-card p { color:var(--on-surface-variant); font-size:13px; }
    .skeleton { animation:pulse 1.4s infinite; } @keyframes pulse { 50% { opacity:.45; } }
    .dashboard-grid { display:grid; grid-template-columns:minmax(0,1.45fr) minmax(300px,.85fr); gap:18px; }
    .panel { padding:28px; }
    .panel-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:26px; }
    .panel-header h3 { font:700 18px 'Space Grotesk',sans-serif; }
    .panel-header p { font-size:13px; }
    .total-pill { padding:5px 10px; border-radius:999px; background:var(--surface-container); color:var(--on-surface-variant); font-size:12px; font-weight:600; }
    .status-list { display:flex; flex-direction:column; gap:18px; }
    .status-row { display:grid; grid-template-columns:130px 1fr 34px; align-items:center; gap:14px; font-size:14px; }
    .status-name { display:flex; align-items:center; gap:9px; } .status-dot { width:9px; height:9px; border-radius:50%; }
    .status-track,.area-track { height:8px; border-radius:999px; background:var(--surface-container); overflow:hidden; }
    .status-fill,.area-fill { height:100%; border-radius:inherit; transition:width .5s ease; }
    .attention-list { display:flex; flex-direction:column; gap:12px; }
    .attention-item { display:flex; align-items:center; gap:14px; padding:16px; border-radius:13px; background:var(--surface-container-low); }
    .attention-item .material-symbols-outlined { width:38px; height:38px; display:grid; place-items:center; border-radius:10px; }
    .attention-item strong { font:700 15px 'Space Grotesk',sans-serif; } .attention-item p { font-size:12px; color:var(--on-surface-variant); margin-top:3px; }
    .danger .material-symbols-outlined { color:#ba1a1a; background:#ffdad6; } .warning .material-symbols-outlined { color:#92400e; background:#fef3c7; } .neutral .material-symbols-outlined { color:var(--primary); background:rgba(240,80,35,.1); }
    .priority-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
    .priority-item { padding:16px; border:1px solid var(--outline-variant); border-radius:13px; }
    .priority-item span { display:block; font-size:12px; color:var(--on-surface-variant); } .priority-item strong { display:block; font:700 25px 'Space Grotesk'; margin:8px 0 2px; } .priority-item small { opacity:.6; }
    .priority-item[data-priority="CRITICA"] { border-color:rgba(186,26,26,.35); background:rgba(186,26,26,.04); }
    .area-list { display:flex; flex-direction:column; gap:15px; } .area-row { display:grid; grid-template-columns:120px 1fr 30px; gap:12px; align-items:center; font-size:13px; }
    .area-fill { background:linear-gradient(90deg,var(--primary),#ff9a55); }
    .capacity-strip { display:grid; grid-template-columns:repeat(3,1fr); margin-top:18px; overflow:hidden; }
    .capacity-strip div { display:grid; grid-template-columns:38px auto; grid-template-rows:auto auto; column-gap:12px; padding:20px 26px; border-right:1px solid var(--outline-variant); }
    .capacity-strip div:last-child { border:0; } .capacity-strip .material-symbols-outlined { grid-row:1/3; align-self:center; color:var(--primary); }
    .capacity-strip strong { font:700 22px 'Space Grotesk'; } .capacity-strip small { color:var(--on-surface-variant); }
    .empty-state,.error-state { padding:32px; text-align:center; color:var(--on-surface-variant); }
    .error-state button { margin-left:8px; color:var(--primary); border:0; background:none; cursor:pointer; font-weight:700; }
    @media(max-width:1100px) { .kpi-grid { grid-template-columns:repeat(2,1fr); } .dashboard-grid { grid-template-columns:1fr; } }
    @media(max-width:650px) { .page-header { align-items:flex-start; gap:16px; flex-direction:column; } .kpi-grid,.priority-grid,.capacity-strip { grid-template-columns:1fr; } .status-row { grid-template-columns:105px 1fr 28px; } .capacity-strip div { border-right:0; border-bottom:1px solid var(--outline-variant); } }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  metrics = signal<DashboardMetrics | null>(null);
  loading = signal(true);

  activeShare = computed(() => this.percentage(this.metrics()?.activeTickets || 0));
  statusRows = computed(() => {
    const statuses = this.metrics()?.ticketsByStatus || {};
    const config = [
      ['ABIERTO', 'Abiertos', '#f05023'], ['ASIGNADO', 'Asignados', '#7c3aed'],
      ['EN_PROCESO', 'En proceso', '#2563eb'], ['PROPUESTO', 'Propuestos', '#d97706'],
      ['RESUELTO', 'Resueltos', '#15803d'], ['CERRADO', 'Cerrados', '#64748b']
    ];
    return config.map(([key, label, color]) => ({ key, label, color, count: statuses[key] || 0, percentage: this.percentage(statuses[key] || 0) }));
  });
  priorityRows = computed(() => {
    const priorities = this.metrics()?.ticketsByPriority || {};
    return [['BAJA','Baja'],['MEDIA','Media'],['ALTA','Alta'],['CRITICA','Crítica']].map(([key,label]) => ({ key, label, count: priorities[key] || 0, percentage: this.percentage(priorities[key] || 0) }));
  });

  ngOnInit() { this.loadMetrics(); }
  loadMetrics() {
    this.loading.set(true);
    this.dashboardService.getMetrics().subscribe({ next: data => { this.metrics.set(data); this.loading.set(false); }, error: () => { this.metrics.set(null); this.loading.set(false); } });
  }
  percentage(value: number) { const total = this.metrics()?.totalTickets || 0; return total ? Math.round(value * 100 / total) : 0; }
  areaPercentage(value: number) { const max = Math.max(...(this.metrics()?.areaWorkload || []).map(area => area.count), 1); return Math.round(value * 100 / max); }
  resolutionTimeLabel() { const hours = this.metrics()?.averageResolutionHours || 0; return hours < 1 ? '< 1 hora' : hours < 24 ? `${hours} h` : `${(hours / 24).toFixed(1)} días`; }
}
