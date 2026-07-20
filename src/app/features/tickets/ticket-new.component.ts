import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from '../../core/services/ticket.service';
import { AreaService } from '../../core/services/area.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-ticket-new',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="new-ticket-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <nav class="breadcrumb">
            <span (click)="goBack()" class="breadcrumb-link">Tickets</span>
            <span class="material-symbols-outlined" style="font-size:14px">chevron_right</span>
            <span class="breadcrumb-current">Nuevo Caso</span>
          </nav>
          <h1 class="page-title">Nuevo Caso</h1>
        </div>
        <div class="header-actions">
          <button class="btn-cancel" (click)="goBack()">Cancelar</button>
          <button class="btn-submit" (click)="onSubmit()" [disabled]="!title.trim() || loading()">
            @if (loading()) {
              <span class="material-symbols-outlined spinning" style="font-size:16px">sync</span>
            }
            Enviar Caso
          </button>
        </div>
      </div>

      <!-- 2-column layout -->
      <div class="ticket-layout">
        <!-- Left: Form -->
        <div class="form-column">
          <!-- Basic Info Card -->
          <div class="form-card">
            <div class="title-field">
              <label class="field-label-sm">TÍTULO DEL CASO</label>
              <input 
                class="title-input"
                [(ngModel)]="title"
                placeholder="Resume brevemente tu solicitud">
            </div>

            <div class="row-fields">
              <div class="field-group">
                <label class="field-label-sm">ÁREA</label>
                <div class="select-wrapper">
                  <select class="field-select" [(ngModel)]="areaId">
                    <option [ngValue]="null">Asignación automática (IA)</option>
                    @for (area of areas(); track area.id) {
                      <option [ngValue]="area.id">{{ area.name }}</option>
                    }
                  </select>
                  <span class="material-symbols-outlined select-icon">expand_more</span>
                </div>
              </div>

              <div class="field-group">
                <label class="field-label-sm">PRIORIDAD</label>
                <div class="priority-pills">
                  <button class="priority-pill" [class.active]="priority === 'BAJA'" (click)="priority = 'BAJA'">Baja</button>
                  <button class="priority-pill" [class.active]="priority === 'MEDIA'" (click)="priority = 'MEDIA'">Media</button>
                  <button class="priority-pill" [class.active]="priority === 'ALTA'" (click)="priority = 'ALTA'">Alta</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Description Card -->
          <div class="form-card description-card">
            <label class="field-label-sm">DESCRIPCIÓN DETALLADA</label>
            <textarea
              class="desc-textarea"
              [(ngModel)]="description"
              placeholder="Describe tu situación o solicitud con el mayor detalle posible..."
              rows="10"></textarea>
            <div class="desc-footer">
              <span class="char-count">{{ description.length }} / 5000 caracteres</span>
            </div>
          </div>
        </div>

        <!-- Right: AI Info Panel -->
        <div class="ai-column">
          <div class="ai-panel">
            <div class="ai-header">
              <div class="ai-icon-wrap">
                <span class="material-symbols-outlined ai-shimmer" style="font-size:18px; font-variation-settings:'FILL' 1">auto_awesome</span>
              </div>
              <h3 class="ai-title">Análisis IA</h3>
            </div>

            <div class="ai-info-content">
              <div class="ai-info-item">
                <span class="material-symbols-outlined" style="font-size:18px; opacity:0.6">psychology</span>
                <p>Al enviar tu caso, la IA analizará el contenido y propondrá una solución automática.</p>
              </div>
              <div class="ai-info-item">
                <span class="material-symbols-outlined" style="font-size:18px; opacity:0.6">route</span>
                <p>Si no seleccionas un área, la IA asignará automáticamente la más adecuada.</p>
              </div>
              <div class="ai-info-item">
                <span class="material-symbols-outlined" style="font-size:18px; opacity:0.6">priority_high</span>
                <p>La prioridad también será evaluada según el contenido de tu descripción.</p>
              </div>
            </div>

            <div class="ai-footer">
              <p>La sugerencia de la IA aparecerá en el detalle del caso una vez creado.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .new-ticket-page { max-width: 1100px; margin: 0 auto; }

    /* Header */
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-end;
      margin-bottom: 40px;
    }
    .breadcrumb {
      display: flex; align-items: center; gap: 6px;
      font-family: 'Geist', sans-serif; font-size: 13px;
      color: var(--on-surface-variant, #4c4546); margin-bottom: 8px;
    }
    .breadcrumb-link { cursor: pointer; transition: color 0.2s; }
    .breadcrumb-link:hover { color: var(--primary, #1b1b1b); }
    .breadcrumb-current { font-weight: 700; color: var(--primary, #1b1b1b); }
    .page-title {
      font-family: 'Geist', sans-serif; font-size: 36px;
      font-weight: 700; letter-spacing: -0.02em; color: var(--primary, #1b1b1b);
    }
    .header-actions { display: flex; align-items: center; gap: 16px; }
    .btn-cancel {
      padding: 10px 24px; background: transparent; border: none;
      font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 500;
      color: var(--on-surface-variant, #4c4546); cursor: pointer; border-radius: 9999px;
      transition: color 0.2s;
    }
    .btn-cancel:hover { color: var(--primary, #1b1b1b); }
    .btn-submit {
      display: flex; align-items: center; gap: 6px;
      padding: 10px 28px; background: var(--primary, #1b1b1b);
      color: white; border: none; border-radius: 9999px;
      font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: opacity 0.2s, transform 0.1s;
      box-shadow: 0 4px 14px rgba(0,0,0,0.12);
    }
    .btn-submit:hover:not(:disabled) { opacity: 0.9; }
    .btn-submit:active:not(:disabled) { transform: scale(0.97); }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Layout */
    .ticket-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
    .form-column { display: flex; flex-direction: column; gap: 24px; }

    /* Cards */
    .form-card {
      background: var(--surface-container-lowest, white); border: 1px solid var(--outline-variant, #cfc4c5);
      border-radius: 16px; padding: 32px;
    }

    /* Title Field */
    .title-field { margin-bottom: 32px; }
    .field-label-sm {
      display: block; font-family: 'Geist', sans-serif; font-size: 11px;
      font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--on-surface-variant, #4c4546); margin-bottom: 12px;
    }
    .title-input {
      width: 100%; border: none; border-bottom: 1px solid var(--outline-variant, #cfc4c5);
      padding: 0 0 8px 0; font-family: 'Geist', sans-serif; font-size: 22px;
      font-weight: 500; outline: none; background: transparent; color: var(--on-surface, #1a1b22);
      transition: border-color 0.2s;
    }
    .title-input::placeholder { color: var(--surface-container-highest, #e3e1ec); }
    .title-input:focus { border-bottom-color: var(--primary, #1b1b1b); }

    /* Row fields */
    .row-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .select-wrapper { position: relative; }
    .field-select {
      width: 100%; padding: 12px 40px 12px 16px; appearance: none;
      background: var(--surface-container-low, #f4f2fd); border: 1px solid transparent;
      border-radius: 10px; font-family: 'Manrope', sans-serif; font-size: 14px;
      color: var(--on-surface, #1a1b22); outline: none; cursor: pointer; transition: border-color 0.2s;
    }
    .field-select:focus { border-color: var(--primary, #1b1b1b); }
    .select-icon {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      pointer-events: none; color: var(--on-surface-variant, #4c4546);
    }

    /* Priority Pills */
    .priority-pills { display: flex; gap: 8px; }
    .priority-pill {
      flex: 1; padding: 12px; border: 1px solid var(--outline-variant, #cfc4c5);
      background: transparent; border-radius: 10px;
      font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 500;
      color: var(--on-surface-variant, #4c4546); cursor: pointer; transition: all 0.15s;
    }
    .priority-pill:hover { background: var(--surface-container-low, #f4f2fd); }
    .priority-pill.active {
      background: var(--primary, #1b1b1b); color: white;
      border-color: var(--primary, #1b1b1b); font-weight: 700;
    }

    /* Description */
    .desc-textarea {
      width: 100%; min-height: 200px; border: none; outline: none;
      resize: vertical; font-family: 'Manrope', sans-serif; font-size: 15px;
      line-height: 1.6; color: var(--on-surface, #1a1b22); background: transparent;
      margin-top: 8px; padding: 0;
    }
    .desc-textarea::placeholder { color: var(--surface-container-highest, #e3e1ec); }
    .desc-footer {
      margin-top: 16px; padding-top: 16px;
      border-top: 1px solid var(--surface-container, #eeedf7);
    }
    .char-count { font-size: 12px; color: var(--on-surface-variant); opacity: 0.5; }

    /* AI Panel */
    .ai-panel {
      background: var(--primary, #1b1b1b); color: white;
      border-radius: 16px; padding: 28px;
      display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }
    .ai-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .ai-icon-wrap {
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center;
    }
    .ai-title {
      font-family: 'Geist', sans-serif; font-size: 12px;
      font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
    }
    .ai-shimmer { animation: shimmer 3s ease-in-out infinite; }
    @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    .ai-info-content { display: flex; flex-direction: column; gap: 18px; flex: 1; }
    .ai-info-item {
      display: flex; align-items: flex-start; gap: 12px;
    }
    .ai-info-item p { font-size: 13px; line-height: 1.5; opacity: 0.85; }

    .ai-footer {
      margin-top: 24px; padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .ai-footer p { font-size: 11px; opacity: 0.4; }

    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    @media (max-width: 900px) {
      .ticket-layout { grid-template-columns: 1fr; }
      .ai-column { order: -1; }
    }
  `]
})
export class TicketNewComponent implements OnInit {
  private ticketService = inject(TicketService);
  private areaService = inject(AreaService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  loading = signal(false);
  areas = signal<any[]>([]);

  title = '';
  description = '';
  priority = 'MEDIA';
  areaId: number | null = null;

  ngOnInit() {
    this.areaService.getAll().subscribe({
      next: (data: any) => {
        this.areas.set(Array.isArray(data) ? data : data.content || []);
      }
    });
  }

  goBack() {
    this.router.navigate(['/app/tickets']);
  }

  onSubmit() {
    if (!this.title.trim()) return;
    this.loading.set(true);

    const payload: any = {
      title: this.title,
      description: this.description,
      priority: this.priority,
      areaId: this.areaId
    };

    this.ticketService.create(payload).subscribe({
      next: (res: any) => {
        this.notification.success('Caso creado exitosamente');
        this.loading.set(false);
        this.router.navigate(['/app/tickets', res.id || '']);
      },
      error: () => {
        this.notification.error('Error al crear el caso');
        this.loading.set(false);
      }
    });
  }
}
