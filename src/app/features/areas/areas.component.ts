import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AreaService, AreaDTO } from '../../core/services/area.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-areas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="areas-page">
      <!-- Header / Top Navigation (if part of content) -->
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">Area Management</h2>
          <p class="page-subtitle">Configure organizational departments, define AI routing logic, and monitor performance metrics.</p>
        </div>
        <div class="header-right">
          <div class="search-box">
            <span class="material-symbols-outlined search-icon">search</span>
            <input type="text" placeholder="Search areas..." [(ngModel)]="searchTerm" class="search-input" />
          </div>
          <button class="btn-primary" (click)="openModal()">
            <span class="material-symbols-outlined icon-left">add</span>
            Add New Area
          </button>
        </div>
      </div>

      <!-- Bento Grid / Cards -->
      <div class="bento-grid">
        <!-- Area Cards Loop -->
        @for (area of filteredAreas(); track area.id) {
          <div class="area-card">
            <div class="card-top">
              <div class="card-header">
                <div class="icon-box">
                  <span class="material-symbols-outlined text-primary">{{ getIconForArea(area.name) }}</span>
                </div>
                <div class="card-actions">
                  <button class="action-btn" (click)="openModal(area)" title="Edit">
                    <span class="material-symbols-outlined" style="font-size:18px">edit</span>
                  </button>
                  <button class="action-btn text-error" (click)="confirmDelete(area)" title="Delete">
                    <span class="material-symbols-outlined" style="font-size:18px">delete</span>
                  </button>
                </div>
              </div>
              <h3 class="area-name">{{ area.name }}</h3>
              <p class="area-desc">{{ area.description || 'Sin descripción' }}</p>
              <div class="area-stats">
                <div class="stat-row">
                  <span class="stat-label">Area Lead</span>
                  <span class="stat-value">Admin User</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Active Tickets</span>
                  <span class="stat-value">{{ getRandomActiveTickets() }}</span>
                </div>
              </div>
            </div>
            <div class="card-bottom">
              <div class="stat-row mb-1">
                <span class="stat-label">AI Accuracy</span>
                <span class="stat-value">{{ getRandomAccuracy() }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width]="getRandomAccuracy() + '%'"></div>
              </div>
            </div>
          </div>
        }

        <!-- AI Logic Card (Static) -->
        <div class="logic-card">
          <div class="logic-content">
            <div class="logic-header">
              <span class="material-symbols-outlined" style="color:var(--tertiary-fixed)">hub</span>
              <h3>Global Logic Mapping</h3>
            </div>
            <p class="logic-desc">Define the intelligence core. Use semantic mapping to route tickets automatically based on intent detection and keyword clustering.</p>
            <div class="logic-grid">
              <div class="logic-box">
                <p class="box-title">KEYWORD FOCUS</p>
                <div class="tags">
                  <span class="tag">SERVER_DOWN</span>
                  <span class="tag">PAYROLL_QUERY</span>
                  <span class="tag">VPN_ERROR</span>
                </div>
              </div>
              <div class="logic-box">
                <p class="box-title">INTENT CLASSIFIERS</p>
                <ul class="intent-list">
                  <li><span class="material-symbols-outlined check-icon">check_circle</span> Urgent Technical Support</li>
                  <li><span class="material-symbols-outlined check-icon">check_circle</span> Admin Document Request</li>
                </ul>
              </div>
            </div>
            <button class="btn-link">
              Configure Routing Engine <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
          <div class="logic-decor decor-1"></div>
          <div class="logic-decor decor-2"></div>
        </div>
      </div>

      <!-- Detailed List Matrix -->
      <div class="matrix-section">
        <div class="matrix-header">
          <h3>Detailed Performance Matrix</h3>
          <div class="matrix-actions">
            <button class="btn-outline">Export Report</button>
            <button class="btn-primary-small">Filter View</button>
          </div>
        </div>
        <div class="matrix-table-wrap">
          <table class="matrix-table">
            <thead>
              <tr>
                <th>DEPARTMENT</th>
                <th>DESCRIPTION</th>
                <th class="text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              @for (area of filteredAreas(); track area.id) {
                <tr>
                  <td class="font-bold">{{ area.name }}</td>
                  <td class="text-secondary">{{ area.description || 'N/A' }}</td>
                  <td class="text-center">
                    <button class="action-btn" (click)="openModal(area)"><span class="material-symbols-outlined" style="font-size:18px">edit</span></button>
                    <button class="action-btn text-error" (click)="confirmDelete(area)"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>
                  </td>
                </tr>
              }
              @if (filteredAreas().length === 0) {
                <tr>
                  <td colspan="3" class="text-center text-secondary py-8">No se encontraron áreas.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    @if (showModal) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingArea ? 'Edit Area' : 'Add New Area' }}</h3>
            <button class="btn-close" (click)="closeModal()">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Area Name</label>
              <input type="text" [(ngModel)]="currentArea.name" placeholder="Ej. IT Support" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="currentArea.description" placeholder="Ej. Hardware, Software, and Network Infra" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-outline" (click)="closeModal()">Cancel</button>
            <button class="btn-primary" (click)="saveArea()" [disabled]="!currentArea.name.trim() || loading()">
              {{ editingArea ? 'Save Changes' : 'Create Area' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirm Modal -->
    @if (areaToDelete) {
      <div class="modal-overlay" (click)="areaToDelete = null">
        <div class="modal-content confirm-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Delete Area</h3>
            <button class="btn-close" (click)="areaToDelete = null">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro que deseas eliminar el área <strong>{{ areaToDelete.name }}</strong>?</p>
            <p class="text-secondary text-sm mt-2">Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-outline" (click)="areaToDelete = null">Cancel</button>
            <button class="btn-primary bg-error" (click)="deleteArea()">Delete</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    
    .areas-page {
      max-width: 1400px; margin: 0 auto;
    }

    /* Header */
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 48px; gap: 24px;
    }
    .page-title {
      font-family: 'Geist', sans-serif; font-size: 40px; font-weight: 700;
      color: var(--primary, #1b1b1b); letter-spacing: -0.02em; margin-bottom: 8px;
    }
    .page-subtitle {
      font-size: 18px; color: var(--on-surface-variant, #4c4546);
      max-width: 600px; line-height: 1.5;
    }
    .header-right {
      display: flex; align-items: center; gap: 24px;
    }
    .search-box {
      position: relative; width: 300px;
    }
    .search-icon {
      position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
      color: var(--outline, #7e7576); pointer-events: none;
    }
    .search-input {
      width: 100%; padding: 12px 16px 12px 48px;
      background: var(--surface-container-low, #f4f2fd);
      border: none; border-radius: 9999px; outline: none;
      font-size: 16px; color: var(--on-surface, #1a1b22);
      transition: box-shadow 0.2s;
    }
    .search-input:focus { box-shadow: 0 0 0 2px var(--primary, #1b1b1b); }

    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 24px; background: var(--primary, #1b1b1b);
      color: white; border: none; border-radius: 9999px;
      font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: opacity 0.2s;
    }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary.bg-error { background: var(--error, #ba1a1a); }
    .icon-left { font-size: 20px; }

    /* Bento Grid */
    .bento-grid {
      display: grid; grid-template-columns: repeat(12, 1fr); gap: 24px;
      margin-bottom: 48px;
    }
    
    .area-card {
      grid-column: span 4;
      background: white; border: 1px solid var(--surface-container, #eeedf7);
      border-radius: 16px; padding: 24px; display: flex; flex-direction: column;
      justify-content: space-between; transition: border-color 0.2s;
    }
    .area-card:hover { border-color: var(--primary, #1b1b1b); }
    .card-top { margin-bottom: 24px; }
    .card-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 20px;
    }
    .icon-box {
      width: 48px; height: 48px; background: var(--surface-container-low, #f4f2fd);
      border-radius: 12px; display: flex; align-items: center; justify-content: center;
    }
    .card-actions { display: flex; gap: 4px; }
    .action-btn {
      width: 32px; height: 32px; border: none; background: transparent;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--outline, #7e7576); transition: all 0.2s;
    }
    .action-btn:hover { background: var(--surface-container-low, #f4f2fd); color: var(--primary, #1b1b1b); }
    .action-btn.text-error:hover { color: var(--error, #ba1a1a); background: var(--error-container, #ffdad6); }
    
    .area-name {
      font-family: 'Geist', sans-serif; font-size: 24px; font-weight: 700;
      margin-bottom: 8px; color: var(--on-surface, #1a1b22);
    }
    .area-desc {
      font-size: 14px; color: var(--on-surface-variant, #4c4546);
      margin-bottom: 20px; line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .area-stats { display: flex; flex-direction: column; gap: 12px; }
    .stat-row { display: flex; justify-content: space-between; align-items: center; }
    .stat-label { font-size: 12px; color: var(--on-surface-variant, #4c4546); }
    .stat-value { font-size: 12px; font-weight: 700; color: var(--on-surface, #1a1b22); }
    .mb-1 { margin-bottom: 8px; }

    .card-bottom {
      padding-top: 20px; border-top: 1px solid var(--surface-container-low, #f4f2fd);
    }
    .progress-bar {
      width: 100%; height: 6px; background: var(--surface-container-low, #f4f2fd);
      border-radius: 9999px; overflow: hidden;
    }
    .progress-fill { height: 100%; background: var(--primary, #1b1b1b); border-radius: 9999px; transition: width 0.5s; }

    /* Logic Card */
    .logic-card {
      grid-column: span 8;
      background: var(--primary, #1b1b1b); color: white;
      border-radius: 16px; padding: 40px; position: relative; overflow: hidden;
      display: flex; flex-direction: column; justify-content: center;
    }
    .logic-content { position: relative; z-index: 10; }
    .logic-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .logic-header h3 { font-family: 'Geist', sans-serif; font-size: 28px; font-weight: 700; }
    .logic-desc { font-size: 16px; opacity: 0.8; max-width: 600px; margin-bottom: 32px; line-height: 1.5; }
    .logic-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }
    .logic-box {
      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; padding: 20px; backdrop-filter: blur(4px);
    }
    .box-title { font-family: 'Geist', sans-serif; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #b4cbce; margin-bottom: 12px; }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag { padding: 4px 10px; background: rgba(255,255,255,0.2); border-radius: 9999px; font-size: 10px; font-weight: 700; }
    .intent-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .intent-list li { display: flex; align-items: center; gap: 8px; font-size: 13px; opacity: 0.9; }
    .check-icon { font-size: 16px; }
    .btn-link {
      display: flex; align-items: center; gap: 8px; background: transparent; border: none;
      color: white; font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 700;
      cursor: pointer; padding: 0;
    }
    .btn-link:hover { text-decoration: underline; }
    .logic-decor { position: absolute; border: 4px solid rgba(255,255,255,0.05); border-radius: 50%; pointer-events: none; }
    .decor-1 { width: 320px; height: 320px; right: -80px; bottom: -80px; }
    .decor-2 { width: 320px; height: 320px; right: -160px; bottom: -160px; }

    /* Matrix */
    .matrix-section {
      background: white; border: 1px solid var(--surface-container, #eeedf7);
      border-radius: 16px; overflow: hidden;
    }
    .matrix-header {
      padding: 24px; border-bottom: 1px solid var(--surface-container, #eeedf7);
      display: flex; justify-content: space-between; align-items: center;
    }
    .matrix-header h3 { font-family: 'Geist', sans-serif; font-size: 20px; font-weight: 700; }
    .matrix-actions { display: flex; gap: 12px; }
    .btn-outline {
      padding: 8px 16px; background: transparent; border: 1px solid var(--surface-container, #eeedf7);
      border-radius: 9999px; font-size: 12px; cursor: pointer; transition: background 0.2s;
    }
    .btn-outline:hover { background: var(--surface-container-low, #f4f2fd); }
    .btn-primary-small {
      padding: 8px 16px; background: var(--primary, #1b1b1b); color: white;
      border: none; border-radius: 9999px; font-size: 12px; cursor: pointer; transition: opacity 0.2s;
    }
    .btn-primary-small:hover { opacity: 0.9; }
    
    .matrix-table-wrap { width: 100%; overflow-x: auto; }
    .matrix-table { width: 100%; border-collapse: collapse; text-align: left; }
    .matrix-table th {
      padding: 16px 24px; background: var(--surface-container-low, #f4f2fd);
      font-family: 'Geist', sans-serif; font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em; color: var(--on-surface-variant, #4c4546);
    }
    .matrix-table td {
      padding: 16px 24px; border-bottom: 1px solid var(--surface-container-low, #f4f2fd);
      font-size: 14px; color: var(--on-surface, #1a1b22);
    }
    .matrix-table tr:hover { background: var(--surface-bright, #fbf8ff); }
    .matrix-table tr:last-child td { border-bottom: none; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 700; }
    .text-secondary { color: var(--on-surface-variant, #4c4546); }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
      z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .modal-content {
      background: white; border-radius: 16px; width: 100%; max-width: 500px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden;
      animation: modalIn 0.2s ease-out;
    }
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .modal-header {
      padding: 24px; border-bottom: 1px solid var(--surface-container, #eeedf7);
      display: flex; justify-content: space-between; align-items: center;
    }
    .modal-header h3 { font-family: 'Geist', sans-serif; font-size: 20px; font-weight: 700; }
    .btn-close {
      width: 32px; height: 32px; border: none; background: transparent;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--outline, #7e7576); transition: background 0.2s;
    }
    .btn-close:hover { background: var(--surface-container-low, #f4f2fd); }
    .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-family: 'Geist', sans-serif; font-size: 12px; font-weight: 700; color: var(--on-surface-variant, #4c4546); }
    .form-group input, .form-group textarea {
      padding: 12px 16px; border: 1px solid var(--outline-variant, #cfc4c5);
      border-radius: 10px; outline: none; font-family: 'Manrope', sans-serif;
      font-size: 14px; transition: border-color 0.2s; resize: vertical;
    }
    .form-group input:focus, .form-group textarea:focus { border-color: var(--primary, #1b1b1b); }
    .modal-footer {
      padding: 20px 24px; border-top: 1px solid var(--surface-container, #eeedf7);
      display: flex; justify-content: flex-end; gap: 12px; background: var(--surface-bright, #fbf8ff);
    }
    .confirm-modal .modal-body { padding: 32px 24px; text-align: center; }

    @media (max-width: 1024px) {
      .area-card { grid-column: span 6; }
      .logic-card { grid-column: span 12; }
    }
    @media (max-width: 768px) {
      .area-card { grid-column: span 12; }
      .page-header { flex-direction: column; }
    }
  `]
})
export class AreasComponent implements OnInit {
  private areaService = inject(AreaService);
  private notification = inject(NotificationService);

  areas = signal<AreaDTO[]>([]);
  loading = signal(false);
  searchTerm = '';

  // Modal State
  showModal = false;
  editingArea = false;
  currentArea: AreaDTO = { name: '', description: '' };
  areaToDelete: AreaDTO | null = null;

  ngOnInit() {
    this.loadAreas();
  }

  loadAreas() {
    this.loading.set(true);
    this.areaService.getAll().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : res.content || [];
        this.areas.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar áreas');
        this.loading.set(false);
      }
    });
  }

  filteredAreas() {
    const term = this.searchTerm.toLowerCase();
    if (!term) return this.areas();
    return this.areas().filter(a => 
      a.name.toLowerCase().includes(term) || 
      (a.description && a.description.toLowerCase().includes(term))
    );
  }

  openModal(area?: AreaDTO) {
    if (area) {
      this.editingArea = true;
      this.currentArea = { ...area };
    } else {
      this.editingArea = false;
      this.currentArea = { name: '', description: '' };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentArea = { name: '', description: '' };
  }

  saveArea() {
    if (!this.currentArea.name.trim()) return;
    this.loading.set(true);

    if (this.editingArea && this.currentArea.id) {
      this.areaService.update(this.currentArea.id, this.currentArea).subscribe({
        next: () => {
          this.notification.success('Área actualizada exitosamente');
          this.loadAreas();
          this.closeModal();
        },
        error: () => {
          this.notification.error('Error al actualizar el área');
          this.loading.set(false);
        }
      });
    } else {
      this.areaService.create(this.currentArea).subscribe({
        next: () => {
          this.notification.success('Área creada exitosamente');
          this.loadAreas();
          this.closeModal();
        },
        error: () => {
          this.notification.error('Error al crear el área');
          this.loading.set(false);
        }
      });
    }
  }

  confirmDelete(area: AreaDTO) {
    this.areaToDelete = area;
  }

  deleteArea() {
    if (!this.areaToDelete?.id) return;
    this.loading.set(true);
    this.areaService.delete(this.areaToDelete.id).subscribe({
      next: () => {
        this.notification.success('Área eliminada exitosamente');
        this.areaToDelete = null;
        this.loadAreas();
      },
      error: () => {
        this.notification.error('Error al eliminar el área');
        this.loading.set(false);
        this.areaToDelete = null;
      }
    });
  }

  // Helpers for Mock Data in UI
  getIconForArea(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('it') || n.includes('sistem')) return 'terminal';
    if (n.includes('rh') || n.includes('human')) return 'badge';
    if (n.includes('operacion') || n.includes('ops')) return 'settings_suggest';
    if (n.includes('finanz') || n.includes('ventas')) return 'payments';
    return 'domain';
  }

  getRandomActiveTickets(): number {
    return Math.floor(Math.random() * 100) + 10;
  }

  getRandomAccuracy(): number {
    return +(Math.random() * 10 + 85).toFixed(1);
  }
}
