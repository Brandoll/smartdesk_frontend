import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from '../../core/services/ticket.service';
import { AreaService, AreaDTO } from '../../core/services/area.service';

@Component({
  selector: 'app-area-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="area-tickets-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h2 class="page-title">Tickets de Área</h2>
          <p class="page-subtitle">Filtra y gestiona los tickets por área de tu organización.</p>
        </div>
      </div>

      <!-- Area Filter Chips -->
      <div class="filter-bar">
        <button class="filter-chip" [class.active]="!selectedAreaId()" (click)="selectArea(null)">
          <span class="material-symbols-outlined" style="font-size:16px">apps</span>
          Todos
        </button>
        @for (area of areas(); track area.id) {
          <button class="filter-chip" [class.active]="selectedAreaId() === area.id" (click)="selectArea(area.id!)">
            <span class="material-symbols-outlined" style="font-size:16px">{{ getIconForArea(area.name) }}</span>
            {{ area.name }}
          </button>
        }
      </div>

      <!-- Tickets List -->
      <div class="tickets-list">
        @if (loading()) {
          <div class="loading-state">
            <span class="material-symbols-outlined spinning" style="font-size:32px; opacity:0.3">sync</span>
            <p>Cargando tickets...</p>
          </div>
        } @else if (tickets().length === 0) {
          <div class="empty-state">
            <span class="material-symbols-outlined" style="font-size:56px; opacity:0.15">inbox</span>
            <p class="empty-title">No hay tickets</p>
            <p class="empty-sub">{{ selectedAreaId() ? 'Esta área no tiene tickets asignados.' : 'No hay tickets disponibles.' }}</p>
          </div>
        } @else {
          @for (ticket of tickets(); track ticket.id) {
            <div class="ticket-row" (click)="openTicket(ticket.id)">
              <div class="ticket-row-left">
                <span class="ticket-id-badge">SD-{{ ticket.id?.toString().substring(0,4) }}</span>
                <div class="ticket-info">
                  <p class="ticket-title">{{ ticket.title }}</p>
                  <p class="ticket-sub">{{ ticket.createdAt | date:'short' }}</p>
                </div>
              </div>
              <div class="ticket-row-right">
                <span class="priority-tag" [attr.data-priority]="ticket.priority">{{ ticket.priority }}</span>
                <span class="status-tag" [attr.data-status]="ticket.status">{{ getStatusLabel(ticket.status) }}</span>
              </div>
            </div>
          }
        }
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="pagination">
          <button class="page-btn" [disabled]="currentPage() === 0" (click)="goToPage(currentPage() - 1)">
            <span class="material-symbols-outlined" style="font-size:18px">chevron_left</span>
          </button>
          <span class="page-info">Página {{ currentPage() + 1 }} de {{ totalPages() }}</span>
          <button class="page-btn" [disabled]="currentPage() >= totalPages() - 1" (click)="goToPage(currentPage() + 1)">
            <span class="material-symbols-outlined" style="font-size:18px">chevron_right</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .area-tickets-page { max-width: 1100px; margin: 0 auto; }

    .page-header { margin-bottom: 24px; }
    .page-title {
      font-family: 'Geist', sans-serif; font-size: 32px; font-weight: 700;
      color: var(--primary, #1b1b1b); letter-spacing: -0.02em; margin-bottom: 4px;
    }
    .page-subtitle { font-size: 15px; color: var(--on-surface-variant); line-height: 1.5; }

    /* Filter Chips */
    .filter-bar {
      display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px;
      padding-bottom: 20px; border-bottom: 1px solid var(--outline-variant);
    }
    .filter-chip {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 18px; background: var(--surface-container-lowest, white);
      border: 1px solid var(--outline-variant); border-radius: 9999px;
      font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 600;
      color: var(--on-surface-variant); cursor: pointer; transition: all 0.15s;
    }
    .filter-chip:hover { border-color: var(--primary); }
    .filter-chip.active {
      background: var(--primary, #1b1b1b); color: white;
      border-color: var(--primary, #1b1b1b);
    }

    /* Ticket List */
    .tickets-list {
      background: var(--surface-container-lowest, white);
      border: 1px solid var(--outline-variant); border-radius: 16px;
      overflow: hidden;
    }
    .ticket-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 24px; border-bottom: 1px solid var(--outline-variant);
      cursor: pointer; transition: background 0.15s;
    }
    .ticket-row:last-child { border-bottom: none; }
    .ticket-row:hover { background: var(--surface-container-low, #f4f2fd); }

    .ticket-row-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
    .ticket-id-badge {
      padding: 3px 10px; background: var(--surface-container, #eeedf7);
      border-radius: 9999px; font-family: 'Geist', sans-serif;
      font-size: 11px; font-weight: 700; color: var(--primary); flex-shrink: 0;
    }
    .ticket-info { flex: 1; min-width: 0; }
    .ticket-title {
      font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 600;
      color: var(--on-surface); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ticket-sub { font-size: 12px; color: var(--on-surface-variant); margin-top: 2px; }

    .ticket-row-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .priority-tag {
      padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700;
      font-family: 'Geist', sans-serif;
    }
    .priority-tag[data-priority="CRITICA"] { background: rgba(186,26,26,0.1); color: #ba1a1a; }
    .priority-tag[data-priority="ALTA"] { background: rgba(245,158,11,0.1); color: #b45309; }
    .priority-tag[data-priority="MEDIA"] { background: var(--surface-container); color: var(--on-surface-variant); }
    .priority-tag[data-priority="BAJA"] { background: var(--surface-container); color: var(--on-surface-variant); opacity: 0.6; }

    .status-tag {
      padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700;
      font-family: 'Geist', sans-serif; background: var(--surface-container); color: var(--on-surface-variant);
    }
    .status-tag[data-status="ABIERTO"] { background: rgba(34,197,94,0.1); color: #16a34a; }
    .status-tag[data-status="EN_PROCESO"] { background: rgba(59,130,246,0.1); color: #2563eb; }
    .status-tag[data-status="CERRADO"] { background: var(--surface-container); color: var(--outline); }

    /* Empty */
    .empty-state, .loading-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 64px 24px; text-align: center;
    }
    .empty-title { font-weight: 700; font-size: 18px; margin-top: 12px; }
    .empty-sub { font-size: 14px; color: var(--on-surface-variant); margin: 4px 0; }

    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* Pagination */
    .pagination {
      display: flex; align-items: center; justify-content: center; gap: 16px;
      margin-top: 24px;
    }
    .page-btn {
      width: 36px; height: 36px; border: 1px solid var(--outline-variant);
      background: var(--surface-container-lowest, white); border-radius: 50%;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      transition: all 0.15s;
    }
    .page-btn:hover:not(:disabled) { background: var(--surface-container-low); }
    .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .page-info { font-size: 13px; color: var(--on-surface-variant); font-weight: 600; }

    @media (max-width: 768px) {
      .ticket-row { flex-direction: column; align-items: flex-start; gap: 10px; }
    }
  `]
})
export class AreaTicketsComponent implements OnInit {
  private ticketService = inject(TicketService);
  private areaService = inject(AreaService);
  private router = inject(Router);

  areas = signal<AreaDTO[]>([]);
  tickets = signal<any[]>([]);
  loading = signal(false);
  selectedAreaId = signal<string | null>(null);
  currentPage = signal(0);
  totalPages = signal(0);

  ngOnInit() {
    this.areaService.getAll().subscribe({
      next: (res: any) => {
        this.areas.set(Array.isArray(res) ? res : res.content || []);
      }
    });
    this.loadTickets();
  }

  selectArea(areaId: string | null) {
    this.selectedAreaId.set(areaId);
    this.currentPage.set(0);
    this.loadTickets();
  }

  loadTickets() {
    this.loading.set(true);
    const areaId = this.selectedAreaId();
    const page = this.currentPage();

    const obs = areaId
      ? this.ticketService.getByArea(areaId, page, 15)
      : this.ticketService.getAll(page, 15);

    obs.subscribe({
      next: (res: any) => {
        this.tickets.set(res.content || []);
        this.totalPages.set(res.totalPages || 1);
        this.loading.set(false);
      },
      error: () => {
        this.tickets.set([]);
        this.loading.set(false);
      }
    });
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadTickets();
  }

  openTicket(id: string) {
    this.router.navigate(['/app/tickets', id]);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ABIERTO': 'Abierto', 'ASIGNADO': 'Asignado', 'EN_PROCESO': 'En Proceso',
      'PROPUESTO': 'Propuesto', 'RESUELTO': 'Resuelto', 'CERRADO': 'Cerrado'
    };
    return labels[status] || status;
  }

  getIconForArea(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('it') || n.includes('sistem') || n.includes('tecn')) return 'terminal';
    if (n.includes('rh') || n.includes('human') || n.includes('talento')) return 'badge';
    if (n.includes('operacion') || n.includes('ops')) return 'settings_suggest';
    if (n.includes('finanz') || n.includes('ventas') || n.includes('contab')) return 'payments';
    return 'domain';
  }
}
