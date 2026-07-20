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
        <h2 class="text-headline-lg" style="letter-spacing:-0.01em">Panel Ejecutivo</h2>
        <p class="text-body-md" style="color:var(--on-surface-variant); opacity:0.7; margin-top:4px">
          Operaciones en tiempo real y métricas de rendimiento de IA.
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
            <div class="icon-box kpi-icon"><span class="material-symbols-outlined">sync</span></div>
            <span class="kpi-badge kpi-badge-stable">Estable</span>
          </div>
          <p class="kpi-label">En Progreso</p>
          <h3 class="kpi-value">{{ getStatusCount('EN_PROCESO') }}</h3>
          <div class="kpi-bar"><div class="kpi-bar-fill" style="width:45%; background:var(--secondary)"></div></div>
        </div>

        <!-- Resolved -->
        <div class="premium-card kpi-card group">
          <div class="kpi-top">
            <div class="icon-box kpi-icon"><span class="material-symbols-outlined">check_circle</span></div>
            <span class="kpi-badge kpi-badge-up" style="color:var(--on-surface)">+8%</span>
          </div>
          <p class="kpi-label">Resueltos</p>
          <h3 class="kpi-value">{{ metrics()?.resolvedTickets || 0 }}</h3>
          <div class="kpi-bar"><div class="kpi-bar-fill" style="width:92%"></div></div>
        </div>

        <!-- Users -->
        <div class="premium-card kpi-card group">
          <div class="kpi-top">
            <div class="icon-box kpi-icon"><span class="material-symbols-outlined">group</span></div>
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
      <!-- Volume Dynamics -->
      <div class="premium-card chart-card">
        <div class="chart-header">
          <div>
            <h4 class="text-headline-md" style="letter-spacing:-0.01em">Dinámica de Volumen</h4>
            <p class="text-body-md" style="color:var(--on-surface-variant); opacity:0.6; margin-top:2px">
              Comparativa de creación vs resolución
            </p>
          </div>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-dot" style="background:var(--primary)"></span>
              <span>Ingreso</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background:var(--outline)"></span>
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

      <!-- AI Diagnostics -->
      <div class="ai-glow-border ai-card">
        <div class="ai-header">
          <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">auto_awesome</span>
          <h4 class="text-headline-md" style="letter-spacing:-0.01em">IA Diagnósticos</h4>
        </div>
        <div class="ai-ring-container">
          <svg class="ai-ring" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="74" fill="transparent" stroke="var(--surface-container-low)" stroke-width="3"></circle>
            <circle cx="80" cy="80" r="74" fill="transparent" stroke="var(--primary)" stroke-width="3"
              stroke-dasharray="465" stroke-dashoffset="18" stroke-linecap="round"
              style="transform:rotate(-90deg); transform-origin:center; transition:stroke-dashoffset 1s ease"></circle>
          </svg>
          <div class="ai-ring-label">
            <span class="ai-ring-value">96<span class="ai-ring-percent">%</span></span>
            <span class="ai-ring-text">PRECISIÓN</span>
          </div>
        </div>
        <div class="ai-metrics">
          <div class="ai-metric-row">
            <span>Confianza del Modelo</span><span class="ai-metric-val">98.2%</span>
          </div>
          <div class="ai-metric-row">
            <span>Detección de Intención</span><span class="ai-metric-val">94.5%</span>
          </div>
          <div class="ai-metric-row" style="border:none">
            <span>Auto-Resolución</span><span class="ai-metric-val">89.0%</span>
          </div>
        </div>
        <button class="ai-config-btn">Configurar Lógica IA</button>
      </div>

      <!-- Categorical Density -->
      <div class="premium-card density-card">
        <h4 class="text-headline-md" style="letter-spacing:-0.01em; margin-bottom:24px">Densidad por Categoría</h4>
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
          <span class="material-symbols-outlined" style="color:var(--primary); margin-top:2px">info</span>
          <p class="text-body-md">Tickets de infraestructura dominan el volumen. IA sugiere redistribución de carga.</p>
        </div>
      </div>

      <!-- Area Summary -->
      <div class="premium-card area-summary-card">
        <div class="area-summary-header">
          <div>
            <h4 class="text-headline-md" style="letter-spacing:-0.01em">Resumen por Áreas</h4>
            <p class="text-body-md" style="color:var(--on-surface-variant); opacity:0.6; margin-top:2px">
              Distribución de carga entre departamentos
            </p>
          </div>
        </div>
        <div class="area-regions">
          <div class="area-region">
            <p class="text-headline-md" style="opacity:0.9">{{ metrics()?.totalAreas || 0 }}</p>
            <p class="text-label-sm" style="color:var(--on-surface-variant); letter-spacing:0.1em; margin-top:4px">ÁREAS ACTIVAS</p>
          </div>
          <div class="area-region" style="opacity:0.5">
            <p class="text-headline-md">{{ metrics()?.totalTickets || 0 }}</p>
            <p class="text-label-sm" style="color:var(--on-surface-variant); letter-spacing:0.1em; margin-top:4px">TICKETS TOTALES</p>
          </div>
          <div class="area-region" style="opacity:0.5">
            <p class="text-headline-md">{{ metrics()?.highPriority || 0 }}</p>
            <p class="text-label-sm" style="color:var(--on-surface-variant); letter-spacing:0.1em; margin-top:4px">PRIORIDAD ALTA</p>
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
      background: var(--surface-container-low);
      padding: 4px;
      border-radius: 9999px;
      border: 1px solid var(--outline-variant);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    }

    .time-btn {
      padding: 6px 20px;
      border: none;
      background: transparent;
      font-family: 'Geist', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: var(--on-surface-variant);
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .time-btn.active {
      background: var(--primary-gradient);
      color: var(--on-primary);
      box-shadow: 0 4px 12px rgba(240, 80, 35, 0.3);
    }

    .time-btn:hover:not(.active) {
      color: var(--on-surface);
      background: var(--surface-variant);
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 32px;
    }

    .kpi-card { 
      padding: 32px; 
      position: relative;
      overflow: hidden;
    }
    
    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: var(--primary-gradient);
      opacity: 0;
      transition: opacity 0.3s ease;
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
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .group:hover .kpi-icon {
      background: var(--primary-gradient);
      color: var(--on-primary);
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 8px 16px rgba(240, 80, 35, 0.25);
    }

    .kpi-badge {
      font-family: 'Geist', sans-serif;
      font-size: 12px;
      font-weight: 600;
      padding: 2px 10px;
      border-radius: 9999px;
    }

    .kpi-badge-up {
      color: var(--error);
      background: rgba(186, 26, 26, 0.06);
      border: 1px solid rgba(186, 26, 26, 0.12);
    }

    .kpi-badge-stable {
      color: var(--on-surface-variant);
      background: var(--surface-container-highest);
    }

    .kpi-label {
      font-family: 'Geist', sans-serif;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.02em;
      color: var(--on-surface-variant);
      margin-bottom: 4px;
    }

    .kpi-value {
      font-family: 'Geist', sans-serif;
      font-size: 48px;
      line-height: 1.1;
      letter-spacing: -0.02em;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .kpi-bar {
      height: 4px;
      background: var(--surface-container-highest);
      border-radius: 9999px;
      overflow: hidden;
    }

    .kpi-bar-fill {
      height: 100%;
      background: var(--primary-gradient);
      border-radius: 9999px;
      transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    
    .kpi-bar-fill::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: shimmer 2s infinite;
    }
    
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    /* Insights Grid */
    .insights-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }

    /* Chart Card */
    .chart-card { padding: 32px; display: flex; flex-direction: column; }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
    }

    .chart-legend {
      display: flex;
      gap: 20px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'Geist', sans-serif;
      font-size: 14px;
      font-weight: 500;
      opacity: 0.7;
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 9999px;
    }

    .chart-bars {
      flex: 1;
      min-height: 280px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
      padding-top: 20px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(207, 196, 197, 0.2);
    }

    .bar-group {
      flex: 1;
      display: flex;
      align-items: flex-end;
      height: 100%;
    }

    .bar {
      width: 100%;
      background: rgba(0, 0, 0, 0.06);
      border-radius: 8px 8px 0 0;
      transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
      cursor: pointer;
    }

    .bar:hover {
      background: rgba(0, 0, 0, 0.12);
    }

    .chart-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      font-family: 'Geist', sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: var(--on-surface-variant);
      opacity: 0.4;
    }

    /* AI Card */
    .ai-card {
      padding: 32px;
      display: flex;
      flex-direction: column;
      background: var(--surface-container-lowest);
      border-radius: 1rem;
      position: relative;
      box-shadow: 0 8px 32px rgba(240, 80, 35, 0.08);
      border: 1px solid var(--outline-variant);
    }
    
    .ai-card::before {
      content: '';
      position: absolute;
      top: -1px; left: -1px; right: -1px; bottom: -1px;
      background: var(--primary-gradient);
      z-index: -1;
      border-radius: 1.1rem;
      opacity: 0.5;
      filter: blur(8px);
    }

    .ai-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    
    .ai-header .material-symbols-outlined {
      color: var(--primary);
      font-size: 28px;
      filter: drop-shadow(0 2px 8px rgba(240, 80, 35, 0.4));
    }

    .ai-ring-container {
      position: relative;
      display: flex;
      justify-content: center;
      padding: 16px 0;
    }

    .ai-ring {
      width: 160px;
      height: 160px;
      filter: drop-shadow(0 4px 12px rgba(240, 80, 35, 0.3));
    }

    .ai-ring-label {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .ai-ring-value {
      font-family: 'Geist', sans-serif;
      font-size: 38px;
      font-weight: 700;
      color: var(--primary);
      text-shadow: 0 2px 10px rgba(240, 80, 35, 0.2);
    }

    .ai-ring-percent {
      font-size: 16px;
      opacity: 0.7;
    }

    .ai-ring-text {
      font-family: 'Geist', sans-serif;
      font-size: 11px;
      font-weight: 700;
      color: var(--primary-fixed-dim);
      text-transform: uppercase;
      letter-spacing: 0.25em;
      margin-top: 4px;
    }

    .ai-metrics {
      margin-top: 24px;
      background: var(--surface-container-low);
      border-radius: 12px;
      padding: 8px 16px;
      border: 1px solid var(--surface-container);
    }

    .ai-metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px dashed rgba(207, 196, 197, 0.4);
      font-family: 'Manrope', sans-serif;
      font-size: 14px;
      color: var(--on-surface-variant);
    }
    
    .ai-metric-row:last-child {
      border-bottom: none;
    }

    .ai-metric-val {
      font-family: 'Geist', sans-serif;
      font-weight: 700;
      color: var(--on-surface);
      background: var(--surface-container-highest);
      padding: 2px 8px;
      border-radius: 6px;
    }

    .ai-config-btn {
      margin-top: 24px;
      width: 100%;
      padding: 16px;
      border: none;
      border-radius: 12px;
      background: var(--surface-container-high);
      font-family: 'Geist', sans-serif;
      font-size: 15px;
      font-weight: 600;
      color: var(--on-surface);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .ai-config-btn:hover {
      background: var(--primary-gradient);
      color: var(--on-primary);
      box-shadow: 0 8px 24px rgba(240, 80, 35, 0.25);
      transform: translateY(-2px);
    }

    .ai-config-btn:active {
      transform: scale(0.98);
    }

    /* Density Card */
    .density-card { padding: 32px; }

    .density-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 24px;
    }

    .density-item-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .density-bar {
      height: 4px;
      background: var(--surface-container-low);
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
      gap: 8px;
      padding: 16px;
      background: var(--surface-container-low);
      border-radius: 12px;
      border: 1px solid rgba(207, 196, 197, 0.3);
    }

    .density-insight p {
      color: var(--on-surface);
      font-size: 14px;
      line-height: 1.5;
    }

    /* Area Summary */
    .area-summary-card { padding: 32px; }

    .area-summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .area-regions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 48px;
      padding: 40px 0;
    }

    .area-region { text-align: center; }

    @media (max-width: 1200px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .insights-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; gap: 16px; align-items: flex-start; }
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
