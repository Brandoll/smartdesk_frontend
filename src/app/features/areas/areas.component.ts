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
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">Áreas</h2>
          <p class="page-subtitle">Gestiona las áreas y departamentos de tu organización.</p>
        </div>
        <div class="header-right">
          <div class="search-box">
            <span class="material-symbols-outlined search-icon">search</span>
            <input type="text" placeholder="Buscar áreas..." [(ngModel)]="searchTerm" class="search-input" />
          </div>
          <button class="btn-primary" (click)="openModal()">
            <span class="material-symbols-outlined icon-left">add</span>
            Nueva Área
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-card-label">TOTAL ÁREAS</span>
          <p class="stat-card-value">{{ areas().length }}</p>
        </div>
      </div>

      <!-- Area Cards Grid -->
      <div class="areas-grid">
        @for (area of filteredAreas(); track area.id) {
          <div class="area-card">
            <div class="card-header">
              <div class="icon-box">
                <span class="material-symbols-outlined text-primary">{{ getIconForArea(area.name) }}</span>
              </div>
              <div class="card-actions">
                <button class="action-btn" (click)="openModal(area)" title="Editar">
                  <span class="material-symbols-outlined" style="font-size:18px">edit</span>
                </button>
                <button class="action-btn text-error" (click)="confirmDelete(area)" title="Eliminar">
                  <span class="material-symbols-outlined" style="font-size:18px">delete</span>
                </button>
              </div>
            </div>
            <h3 class="area-name">{{ area.name }}</h3>
            <p class="area-desc">{{ area.description || 'Sin descripción' }}</p>
          </div>
        }

        @if (filteredAreas().length === 0 && !loading()) {
          <div class="empty-state">
            <span class="material-symbols-outlined" style="font-size:56px; opacity:0.15">domain</span>
            <p class="empty-title">No hay áreas registradas</p>
            <p class="empty-sub">Crea tu primera área para organizar los tickets.</p>
            <button class="btn-primary" (click)="openModal()">
              <span class="material-symbols-outlined icon-left">add</span>
              Nueva Área
            </button>
          </div>
        }
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    @if (showModal) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingArea ? 'Editar Área' : 'Nueva Área' }}</h3>
            <button class="btn-close" (click)="closeModal()">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>NOMBRE DEL ÁREA</label>
              <input type="text" [(ngModel)]="currentArea.name" placeholder="Ej. Soporte IT" />
            </div>
            <div class="form-group">
              <label>DESCRIPCIÓN</label>
              <textarea [(ngModel)]="currentArea.description" placeholder="Ej. Hardware, Software e Infraestructura" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-outline" (click)="closeModal()">Cancelar</button>
            <button class="btn-primary" (click)="saveArea()" [disabled]="!currentArea.name.trim() || loading()">
              {{ editingArea ? 'Guardar Cambios' : 'Crear Área' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal Confirmar Eliminación -->
    @if (areaToDelete) {
      <div class="modal-overlay" (click)="areaToDelete = null">
        <div class="modal-content confirm-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Eliminar Área</h3>
            <button class="btn-close" (click)="areaToDelete = null">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro que deseas eliminar el área <strong>{{ areaToDelete.name }}</strong>?</p>
            <p class="text-secondary text-sm mt-2">Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-outline" (click)="areaToDelete = null">Cancelar</button>
            <button class="btn-primary bg-error" (click)="deleteArea()">Eliminar</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    
    .areas-page { max-width: 1400px; margin: 0 auto; }

    /* Header */
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 32px; gap: 24px;
    }
    .page-title {
      font-family: 'Geist', sans-serif; font-size: 32px; font-weight: 700;
      color: var(--primary, #1b1b1b); letter-spacing: -0.02em; margin-bottom: 4px;
    }
    .page-subtitle {
      font-size: 15px; color: var(--on-surface-variant, #4c4546); line-height: 1.5;
    }
    .header-right { display: flex; align-items: center; gap: 16px; }
    .search-box { position: relative; width: 260px; }
    .search-icon {
      position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
      color: var(--outline, #7e7576); pointer-events: none; font-size: 20px;
    }
    .search-input {
      width: 100%; padding: 10px 16px 10px 44px;
      background: var(--surface-container-low, #f4f2fd);
      border: 1px solid var(--outline-variant); border-radius: 9999px; outline: none;
      font-size: 14px; color: var(--on-surface, #1a1b22); transition: border-color 0.2s;
    }
    .search-input:focus { border-color: var(--primary, #1b1b1b); }

    .btn-primary {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 10px 22px; background: var(--primary, #1b1b1b);
      color: white; border: none; border-radius: 9999px;
      font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: opacity 0.2s;
    }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary.bg-error { background: var(--error, #ba1a1a); }
    .icon-left { font-size: 18px; }

    /* Stats */
    .stats-row { margin-bottom: 24px; }
    .stat-card {
      display: inline-block; padding: 20px 28px;
      background: var(--surface-container-lowest, white);
      border: 1px solid var(--outline-variant); border-radius: 14px;
    }
    .stat-card-label {
      font-family: 'Geist', sans-serif; font-size: 11px; font-weight: 700;
      color: var(--on-surface-variant); text-transform: uppercase; letter-spacing: 0.05em;
    }
    .stat-card-value {
      font-family: 'Geist', sans-serif; font-size: 28px; font-weight: 700; margin-top: 4px;
    }

    /* Grid */
    .areas-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;
    }

    .area-card {
      background: var(--surface-container-lowest, white);
      border: 1px solid var(--outline-variant);
      border-radius: 16px; padding: 24px; transition: border-color 0.2s;
    }
    .area-card:hover { border-color: var(--primary, #1b1b1b); }
    .card-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 16px;
    }
    .icon-box {
      width: 44px; height: 44px; background: var(--surface-container-low, #f4f2fd);
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
      font-family: 'Geist', sans-serif; font-size: 20px; font-weight: 700;
      margin-bottom: 6px; color: var(--on-surface, #1a1b22);
    }
    .area-desc {
      font-size: 14px; color: var(--on-surface-variant, #4c4546);
      line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }

    /* Empty State */
    .empty-state {
      grid-column: 1 / -1;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 64px 24px; text-align: center;
    }
    .empty-title { font-weight: 700; font-size: 18px; margin-top: 12px; }
    .empty-sub { font-size: 14px; color: var(--on-surface-variant); margin: 8px 0 20px; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
      z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .modal-content {
      background: white; border-radius: 16px; width: 100%; max-width: 480px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden;
      animation: modalIn 0.2s ease-out;
    }
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .modal-header {
      padding: 20px 24px; border-bottom: 1px solid var(--outline-variant);
      display: flex; justify-content: space-between; align-items: center;
    }
    .modal-header h3 { font-family: 'Geist', sans-serif; font-size: 18px; font-weight: 700; }
    .btn-close {
      width: 32px; height: 32px; border: none; background: transparent;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--outline, #7e7576); transition: background 0.2s;
    }
    .btn-close:hover { background: var(--surface-container-low, #f4f2fd); }
    .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label {
      font-family: 'Geist', sans-serif; font-size: 11px; font-weight: 700;
      color: var(--on-surface-variant); text-transform: uppercase; letter-spacing: 0.05em;
    }
    .form-group input, .form-group textarea {
      padding: 12px 16px; border: 1px solid var(--outline-variant, #cfc4c5);
      border-radius: 10px; outline: none; font-family: 'Manrope', sans-serif;
      font-size: 14px; transition: border-color 0.2s; resize: vertical;
    }
    .form-group input:focus, .form-group textarea:focus { border-color: var(--primary, #1b1b1b); }
    .modal-footer {
      padding: 16px 24px; border-top: 1px solid var(--outline-variant);
      display: flex; justify-content: flex-end; gap: 12px;
    }
    .btn-outline {
      padding: 10px 20px; background: transparent; border: 1px solid var(--outline-variant);
      border-radius: 9999px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s;
    }
    .btn-outline:hover { background: var(--surface-container-low, #f4f2fd); }
    .confirm-modal .modal-body { padding: 28px 24px; }
    .text-secondary { color: var(--on-surface-variant); }
    .text-sm { font-size: 13px; }
    .mt-2 { margin-top: 8px; }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; }
      .areas-grid { grid-template-columns: 1fr; }
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

  getIconForArea(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('it') || n.includes('sistem') || n.includes('tecn')) return 'terminal';
    if (n.includes('rh') || n.includes('human') || n.includes('talento')) return 'badge';
    if (n.includes('operacion') || n.includes('ops')) return 'settings_suggest';
    if (n.includes('finanz') || n.includes('ventas') || n.includes('contab')) return 'payments';
    if (n.includes('marketing') || n.includes('comunic')) return 'campaign';
    return 'domain';
  }
}
