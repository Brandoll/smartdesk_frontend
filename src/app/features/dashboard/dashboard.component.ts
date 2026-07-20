import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardMetrics } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Page Header -->
    <header class="page-header">
      <div>
        <h2 class="text-headline-lg">Panel Ejecutivo</h2>
        <p class="text-body-md" style="color:var(--on-surface-variant); opacity:0.8; margin-top:4px">
          Operaciones en tiempo real y métricas de rendimiento.
        </p>
      </div>
      <div class="time-filter">
        <button class="time-btn active">24h</button>
        <button class="time-btn">7d</button>
        <button class="time-btn">30d</button>
      </div>
    </header>

    <!-- KPI Cards -->
    @if (loading()) {
      <div class="kpi-grid">
        @for (i of [1,2,3,4]; track i) {
          <div class="premium-card kpi-card skeleton-pulse"></div>
        }
      </div>
    } @else {
      <div class="kpi-grid">
        <!-- Open Tickets -->
        <div class="premium-card kpi-card group">
          <div class="kpi-top">
            <div class="icon-box kpi-icon"><span class="material-symbols-outlined">pending_actions</span></div>
            <span class="kpi-badge kpi-badge-up">+12%</span>
          </div>
          <p class="kpi-label">Tickets Abiertos</p>
          <h3 class="kpi-value">{{ metrics()?.openTickets || 0 }}</h3>
          <div class="kpi-bar"><div class="kpi-bar-fill" style="width:70%"></div></div>
        </div>

        <!-- In Progress -->
        <div class="premium-card kpi-card group">
          <div class="kpi-top">
            <div class="icon-box kpi-icon" style="color: var(--secondary)"><span class="material-symbols-outlined">sync</span></div>
            <span class="kpi-badge kpi-badge-stable">Estable</span>
          </div>
          <p class="kpi-label">En Progreso</p>
          <h3 class="kpi-value">{{ getStatusCount('EN_PROCESO') }}</h3>
          <div class="kpi-bar"><div class="kpi-bar-fill" style="width:45%; background:var(--secondary)"></div></div>
        </div>

        <!-- Resolved -->
        <div class="premium-card kpi-card group">
          <div class="kpi-top">
            <div class="icon-box kpi-icon" style="color: var(--on-surface)"><span class="material-symbols-outlined">check_circle</span></div>
            <span class="kpi-badge kpi-badge-up" style="color:var(--on-surface); border-color:var(--outline-variant); background:var(--surface-container)">+8%</span>
          </div>
          <p class="kpi-label">Resueltos</p>
          <h3 class="kpi-value">{{ metrics()?.resolvedTickets || 0 }}</h3>
          <div class="kpi-bar"><div class="kpi-bar-fill" style="width:92%; background:var(--on-surface)"></div></div>
        </div>

        <!-- Users -->
        <div class="premium-card kpi-card group">
          <div class="kpi-top">
            <div class="icon-box kpi-icon" style="color: var(--outline)"><span class="material-symbols-outlined">group</span></div>
            <span class="kpi-badge kpi-badge-stable">Total</span>
          </div>
          <p class="kpi-label">Colaboradores</p>
          <h3 class="kpi-value">{{ metrics()?.totalUsers || 0 }}</h3>
          <div class="kpi-bar"><div class="kpi-bar-fill" style="width:30%; background:var(--outline)"></div></div>
        </div>
      </div>
    }

    <!-- Main Grid -->
    <div class="insights-grid">
      <!-- Left Column -->
      <div class="main-column">
        <!-- Volume Dynamics -->
        <div class="premium-card chart-card">
          <div class="chart-header">
            <div>
              <h4 class="text-headline-md">Dinámica de Volumen</h4>
              <p class="text-body-md" style="color:var(--on-surface-variant); opacity:0.8; margin-top:2px">
                Comparativa de creación vs resolución
              </p>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-dot" style="background:var(--primary)"></span>
                <span>Ingreso</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background:var(--outline-variant)"></span>
                <span>Cierre</span>
              </div>
            </div>
          </div>
          <div class="chart-bars">
            @for (day of weekDays; track day.name; let i = $index) {
              <div class="bar-group">
                <div class="bar" [style.height.%]="day.height"></div>
              </div>
            }
          </div>
          <div class="chart-labels">
            @for (day of weekDays; track day.name) {
              <span>{{ day.name }}</span>
            }
          </div>
        </div>
      </div>
      
      <!-- Right Column -->
      <div class="side-column">
        <!-- Categorical Density -->
        <div class="premium-card density-card">
          <h4 class="text-headline-md" style="margin-bottom:24px">Densidad por Categoría</h4>
          <div class="density-list">
            @for (cat of categories; track cat.name) {
              <div class="density-item">
                <div class="density-item-header">
                  <span class="text-label-md">{{ cat.name }}</span>
                  <span class="text-label-sm" style="color:var(--on-surface-variant)">{{ cat.pct }}%</span>
                </div>
                <div class="density-bar">
                  <div class="density-bar-fill" [style.width.%]="cat.pct" [style.background]="cat.color"></div>
                </div>
              </div>
            }
          </div>
          <div class="density-insight">
            <span class="material-symbols-outlined insight-icon">lightbulb</span>
            <p class="text-body-md">Tickets de infraestructura dominan el volumen. Se sugiere revisar carga.</p>
          </div>
        </div>

        <!-- Area Summary -->
        <div class="premium-card area-summary-card">
          <div class="area-summary-header">
            <div>
              <h4 class="text-headline-md">Resumen por Áreas</h4>
              <p class="text-body-md" style="color:var(--on-surface-variant); opacity:0.8; margin-top:2px">
                Distribución de carga
              </p>
            </div>
          </div>
          <div class="area-regions">
            <div class="area-region">
              <p class="text-headline-xl text-primary">{{ metrics()?.totalAreas || 0 }}</p>
              <p class="text-label-sm area-label">ÁREAS</p>
            </div>
            <div class="area-region">
              <p class="text-headline-xl">{{ metrics()?.totalTickets || 0 }}</p>
              <p class="text-label-sm area-label">TICKETS</p>
            </div>
            <div class="area-region">
              <p class="text-headline-xl text-error">{{ metrics()?.highPriority || 0 }}</p>
              <p class="text-label-sm area-label">ALTA PR.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .page-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 32px;
    }

    .time-filter {
      display: flex;
      align-items: center;
      gap: 4px;
      background: var(--surface-container-lowest);
      padding: 4px;
      border-radius: 9999px;
      border: 1px solid var(--outline-variant);
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }

    .time-btn {
      padding: 6px 20px;
      border: none;
      background: transparent;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: var(--on-surface-variant);
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .time-btn.active {
      background: var(--surface-container-low);
      color: var(--on-surface);
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .time-btn:hover:not(.active) {
      color: var(--on-surface);
      background: rgba(0,0,0,0.02);
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-bottom: 32px;
    }

    .kpi-card { 
      padding: 32px; 
      position: relative;
      overflow: hidden;
      background: var(--surface-container-lowest);
      border: 1px solid rgba(0,0,0,0.04);
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
    }
    
    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: var(--primary);
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    
    .group:hover.kpi-card::before {
      opacity: 1;
    }

    .kpi-card.skeleton-pulse {
      height: 180px;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .kpi-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .kpi-icon {
      background: var(--surface-container-low);
      color: var(--primary);
      transition: all 0.3s ease;
    }

    .group:hover .kpi-icon {
      background: var(--primary-container);
      color: var(--primary-fixed-dim);
      transform: scale(1.1) rotate(5deg);
    }

    .kpi-badge {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 9999px;
    }

    .kpi-badge-up {
      color: var(--error);
      background: var(--error-container);
      border: 1px solid rgba(186, 26, 26, 0.1);
    }

    .kpi-badge-stable {
      color: var(--on-surface-variant);
      background: var(--surface-container);
    }

    .kpi-label {
      font-family: 'Hanken Grotesk', sans-serif;
      font-size: 15px;
      font-weight: 500;
      color: var(--on-surface-variant);
      margin-bottom: 8px;
    }

    .kpi-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 48px;
      line-height: 1;
      font-weight: 700;
      color: var(--on-surface);
      margin-bottom: 24px;
    }

    .kpi-bar {
      height: 6px;
      background: var(--surface-container);
      border-radius: 9999px;
      overflow: hidden;
    }

    .kpi-bar-fill {
      height: 100%;
      background: var(--primary);
      border-radius: 9999px;
      transition: width 1s ease;
    }

    /* Insights Grid */
    .insights-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }

    .main-column {
      display: flex;
      flex-direction: column;
    }

    .side-column {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Chart Card */
    .chart-card { 
      padding: 40px; 
      display: flex; 
      flex-direction: column; 
      height: 100%;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
    }

    .chart-legend {
      display: flex;
      gap: 24px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Hanken Grotesk', sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: var(--on-surface-variant);
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .chart-bars {
      flex: 1;
      min-height: 300px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
      padding-top: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--outline-variant);
    }

    .bar-group {
      flex: 1;
      display: flex;
      align-items: flex-end;
      height: 100%;
    }

    .bar {
      width: 100%;
      background: var(--surface-container-high);
      border-radius: 8px 8px 0 0;
      transition: all 0.5s ease;
      cursor: pointer;
    }

    .bar:hover {
      background: var(--primary);
      opacity: 0.8;
    }

    .chart-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: var(--on-surface-variant);
    }

    /* Density Card */
    .density-card { padding: 40px; }

    .density-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-bottom: 32px;
    }

    .density-item-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .density-bar {
      height: 6px;
      background: var(--surface-container);
      border-radius: 9999px;
      overflow: hidden;
    }

    .density-bar-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 1s ease;
    }

    .density-insight {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 20px;
      background: rgba(240, 80, 35, 0.05);
      border-radius: 12px;
      border: 1px dashed rgba(240, 80, 35, 0.2);
    }
    
    .insight-icon {
      color: var(--primary);
    }

    .density-insight p {
      color: var(--on-surface-variant);
      font-family: 'Hanken Grotesk', sans-serif;
      font-size: 15px;
      line-height: 1.5;
    }

    /* Area Summary */
    .area-summary-card { padding: 40px; }

    .area-summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .area-regions {
      display: flex;
      justify-content: space-around;
      gap: 16px;
    }

    .area-region { text-align: center; }

    .text-primary { color: var(--primary); }
    .text-error { color: var(--error); }
    
    .area-label {
      color: var(--on-surface-variant);
      letter-spacing: 0.1em;
      margin-top: 8px;
    }

    @media (max-width: 1200px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .insights-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; gap: 16px; align-items: flex-start; }
      .area-regions { flex-direction: column; gap: 32px; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  metrics = signal<DashboardMetrics | null>(null);
  loading = signal<boolean>(true);

  weekDays = [
    { name: 'LUN', height: 40 },
    { name: 'MAR', height: 65 },
    { name: 'MIÉ', height: 55 },
    { name: 'JUE', height: 85 },
    { name: 'VIE', height: 75 },
    { name: 'SÁB', height: 30 },
    { name: 'DOM', height: 20 }
  ];

  categories = [
    { name: 'Infraestructura', pct: 45, color: 'var(--primary)' },
    { name: 'Operaciones', pct: 28, color: 'var(--secondary)' },
    { name: 'Soporte al Cliente', pct: 15, color: 'var(--outline)' }
  ];

  ngOnInit() {
    this.dashboardService.getMetrics().subscribe({
      next: (data) => {
        this.metrics.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getStatusCount(status: string): number {
    const m = this.metrics();
    if (!m) return 0;
    // Approximate: EN_PROCESO = total - open - resolved
    if (status === 'EN_PROCESO') {
      return Math.max(0, (m.totalTickets || 0) - (m.openTickets || 0) - (m.resolvedTickets || 0));
    }
    return 0;
  }
}
