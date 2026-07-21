import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AppStateService } from '../../core/state/app-state.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { TicketService } from '../../core/services/ticket.service';
import { AreaService } from '../../core/services/area.service';
import { UserService } from '../../core/services/user.service';

type SearchContext = 'tickets' | 'areas' | 'users' | 'none';

interface SearchResult {
  id: string;
  type: Exclude<SearchContext, 'none'>;
  title: string;
  subtitle: string;
  badge: string;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="topbar">
      <!-- Search -->
      <div class="topbar-search-wrapper">
        <div class="topbar-search" [class.is-open]="showSearchResults()">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            #searchInput
            type="text"
            [placeholder]="searchPlaceholder()"
            class="search-input"
            [disabled]="searchContext() === 'none'"
            [ngModel]="searchTerm()"
            (ngModelChange)="onSearchChange($event)"
            (focus)="onSearchFocus()"
            (keydown.escape)="closeSearch()"
            autocomplete="off"
          />
          @if (searchTerm()) {
            <button class="search-clear" type="button" (click)="clearSearch()" title="Limpiar búsqueda">
              <span class="material-symbols-outlined">close</span>
            </button>
          }

          @if (showSearchResults()) {
            <div class="search-results">
              <div class="search-results-heading">
                <span>{{ contextLabel() }}</span>
                @if (searching()) { <span class="searching-label">Buscando...</span> }
              </div>
              @if (!searching() && searchResults().length === 0) {
                <div class="search-empty">No encontramos resultados para “{{ searchTerm() }}”.</div>
              } @else {
                @for (result of searchResults(); track result.type + result.id) {
                  <button type="button" class="search-result" (click)="openSearchResult(result)">
                    <span class="result-copy">
                      <strong>{{ result.title }}</strong>
                      <small>{{ result.subtitle }}</small>
                    </span>
                    <span class="result-badge">{{ result.badge }}</span>
                    <span class="material-symbols-outlined result-arrow">arrow_forward</span>
                  </button>
                }
              }
            </div>
          }
        </div>
      </div>

      <!-- Actions -->
      <div class="topbar-actions">
        <div class="topbar-icons">
          <div class="notif-container">
            <button class="icon-btn" title="Notificaciones" (click)="toggleNotifMenu($event)">
              <span class="material-symbols-outlined">notifications</span>
              @if (notifService.unreadCount() > 0) {
                <span class="notif-badge">{{ notifService.unreadCount() }}</span>
              }
            </button>
            @if (showNotifMenu()) {
              <div class="notif-dropdown">
                <div class="notif-dropdown-header">
                  <span class="notif-dropdown-title">Notificaciones</span>
                  @if (notifService.unreadCount() > 0) {
                    <button class="notif-mark-read" (click)="notifService.markAllRead()">Marcar leídas</button>
                  }
                </div>
                <div class="notif-dropdown-body">
                  @if (notifService.notifications().length === 0) {
                    <div class="notif-empty">
                      <span class="material-symbols-outlined" style="font-size:36px; opacity:0.2">notifications_off</span>
                      <p>Sin notificaciones</p>
                    </div>
                  } @else {
                    @for (n of notifService.notifications(); track n.id) {
                      <button type="button" class="notif-item" [class.unread]="!n.read" (click)="openNotification(n)">
                        <span class="material-symbols-outlined notif-item-icon" style="font-variation-settings:'FILL' 1">circle_notifications</span>
                        <div class="notif-item-content">
                          <p class="notif-item-msg">{{ n.message }}</p>
                          <p class="notif-item-time">{{ n.timestamp | date:'short' }}</p>
                        </div>
                      </button>
                    }
                  }
                </div>
              </div>
              <div class="dropdown-overlay" (click)="showNotifMenu.set(false)"></div>
            }
          </div>
        </div>

        <div class="topbar-divider"></div>

        <!-- User -->
        <div class="topbar-user-container">
          <div class="topbar-user" (click)="showUserMenu.set(!showUserMenu())">
            <div class="topbar-user-info">
              <p class="topbar-user-name">{{ appState.currentUser()?.name || 'Usuario' }}</p>
              <p class="topbar-user-role">{{ formatRole(appState.currentUser()?.role) }}</p>
            </div>
            <div class="topbar-user-avatar">
              <span class="material-symbols-outlined">person</span>
            </div>
          </div>
          
          <!-- Dropdown Menu -->
          @if (showUserMenu()) {
            <div class="user-dropdown-menu">
              <div class="dropdown-header">
                <p class="dropdown-name">{{ appState.currentUser()?.name }}</p>
                <p class="dropdown-email">{{ appState.currentUser()?.email }}</p>
              </div>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item" (click)="navigateToProfile()">
                <span class="material-symbols-outlined">person</span>
                Mi Perfil
              </button>
              <button class="dropdown-item" (click)="navigateToSettings()">
                <span class="material-symbols-outlined">settings</span>
                Configuración
              </button>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item text-error" (click)="logout()">
                <span class="material-symbols-outlined">logout</span>
                Cerrar Sesión
              </button>
            </div>
            <!-- Overlay to close menu when clicking outside -->
            <div class="dropdown-overlay" (click)="showUserMenu.set(false)"></div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      width: 100%;
      height: 72px;
      position: sticky;
      top: 0;
      z-index: 50;
      background: var(--surface-container-lowest);
      border-bottom: 1px solid var(--outline-variant);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 40px;
    }

    .topbar-search-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
    }

    .topbar-search {
      position: relative;
      width: 100%;
      max-width: 480px;
      z-index: 103;
    }

    .search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--on-surface-variant);
      opacity: 0.6;
      font-size: 20px;
    }

    .search-input {
      width: 100%;
      padding: 10px 44px;
      background: var(--surface-container-lowest);
      border: 1px solid var(--outline-variant);
      border-radius: 9999px;
      font-family: 'Hanken Grotesk', sans-serif;
      font-size: 14px;
      color: var(--on-surface);
      outline: none;
      transition: all 0.2s;
    }

    .search-input::placeholder {
      opacity: 0.4;
    }

    .search-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(240, 80, 35, 0.08);
    }

    .search-input:disabled { cursor:not-allowed; opacity:.55; background:var(--surface-container-low); }

    .search-clear {
      position:absolute; right:9px; top:50%; transform:translateY(-50%);
      width:30px; height:30px; display:grid; place-items:center;
      border:0; border-radius:999px; background:transparent; color:var(--on-surface-variant); cursor:pointer;
    }
    .search-clear:hover { background:var(--surface-container-low); color:var(--on-surface); }
    .search-clear .material-symbols-outlined { font-size:18px; }

    .search-results {
      position:absolute; top:calc(100% + 10px); left:0; width:100%;
      background:var(--surface-container-lowest); border:1px solid var(--outline-variant);
      border-radius:14px; box-shadow:0 16px 40px rgba(24,20,18,.12);
      overflow:hidden; z-index:105; animation:slideDown .16s ease-out;
    }
    .search-results-heading {
      display:flex; justify-content:space-between; align-items:center;
      padding:11px 15px; border-bottom:1px solid var(--outline-variant);
      color:var(--on-surface-variant); font:700 10px 'Space Grotesk',sans-serif;
      letter-spacing:.1em; text-transform:uppercase;
    }
    .searching-label { color:var(--primary); letter-spacing:0; text-transform:none; }
    .search-result {
      width:100%; display:grid; grid-template-columns:minmax(0,1fr) auto 18px; align-items:center; gap:12px;
      padding:13px 15px; border:0; border-bottom:1px solid var(--surface-container);
      background:var(--surface-container-lowest); color:var(--on-surface); text-align:left; cursor:pointer;
      font-family:'Hanken Grotesk',sans-serif; transition:background .15s;
    }
    .search-result:last-child { border-bottom:0; }
    .search-result:hover,.search-result:focus-visible { background:rgba(240,80,35,.055); outline:0; }
    .result-copy { min-width:0; display:flex; flex-direction:column; gap:3px; }
    .result-copy strong { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font:600 13px 'Space Grotesk',sans-serif; }
    .result-copy small { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--on-surface-variant); font-size:11px; }
    .result-badge { padding:4px 8px; border-radius:999px; background:var(--surface-container-low); color:var(--on-surface-variant); font-size:10px; font-weight:700; }
    .result-arrow { color:var(--primary); font-size:17px; opacity:.75; }
    .search-empty { padding:28px 18px; color:var(--on-surface-variant); text-align:center; font-size:13px; }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .topbar-icons {
      display: flex;
      align-items: center;
      gap: 4px;
      padding-right: 12px;
    }

    .icon-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: var(--on-surface-variant);
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .icon-btn:hover {
      background: var(--surface-container);
    }

    .topbar-divider {
      width: 1px;
      height: 24px;
      background: var(--outline-variant);
    }

    .topbar-user-container {
      position: relative;
    }

    .topbar-user {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-left: 12px;
      cursor: pointer;
    }

    .topbar-user:hover .topbar-user-name {
      color: var(--primary);
    }

    .topbar-user-info {
      text-align: right;
    }

    .topbar-user-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: var(--on-surface);
      transition: color 0.2s;
    }

    .topbar-user-role {
      font-family: 'Hanken Grotesk', sans-serif;
      font-size: 11px;
      font-weight: 500;
      color: var(--on-surface-variant);
      opacity: 0.7;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .topbar-user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 9999px;
      overflow: hidden;
      background: rgba(240, 80, 35, 0.1);
      color: var(--primary);
      border: 1px solid rgba(240, 80, 35, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .topbar-user:hover .topbar-user-avatar {
      border-color: var(--primary);
      background: var(--primary);
      color: var(--on-primary);
    }

    .topbar-user-avatar .material-symbols-outlined { font-size:22px; font-variation-settings:'FILL' 1; }

    /* Dropdown Menu Styles */
    .user-dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 240px;
      background: var(--surface-container-lowest);
      border: 1px solid var(--outline-variant);
      border-radius: 16px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
      padding: 8px 0;
      z-index: 101;
      animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .dropdown-header {
      padding: 12px 20px;
    }

    .dropdown-name {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 14px;
      color: var(--on-surface);
    }

    .dropdown-email {
      font-family: 'Hanken Grotesk', sans-serif;
      font-size: 12px;
      color: var(--on-surface-variant);
      opacity: 0.8;
      margin-top: 2px;
    }

    .dropdown-divider {
      height: 1px;
      background: var(--outline-variant);
      margin: 8px 0;
    }

    .dropdown-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 20px;
      background: transparent;
      border: none;
      font-family: 'Hanken Grotesk', sans-serif;
      font-size: 15px;
      font-weight: 500;
      color: var(--on-surface);
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
    }

    .dropdown-item:hover {
      background: var(--surface-container-low);
    }

    .dropdown-item .material-symbols-outlined {
      font-size: 18px;
      opacity: 0.7;
    }

    .dropdown-item.text-error {
      color: var(--error);
    }

    .dropdown-item.text-error .material-symbols-outlined {
      color: var(--error);
      opacity: 1;
    }

    .dropdown-overlay {
      position: fixed;
      inset: 0;
      z-index: 100;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    /* Notification container */
    .notif-container { position: relative; }
    .notif-badge {
      position: absolute; top: 2px; right: 2px;
      min-width: 18px; height: 18px; padding: 0 5px;
      background: var(--error, #ba1a1a); color: white;
      border-radius: 9999px; font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Space Grotesk', sans-serif;
      border: 2px solid var(--surface, #fbf8ff);
    }
    .notif-dropdown {
      position: absolute; top: calc(100% + 8px); right: 0;
      width: 340px; background: var(--surface-container-lowest, white);
      border: 1px solid var(--outline-variant); border-radius: 16px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.12); z-index: 101;
      animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }
    .notif-dropdown-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; border-bottom: 1px solid var(--outline-variant);
    }
    .notif-dropdown-title {
      font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700;
    }
    .notif-mark-read {
      background: none; border: none; color: var(--primary);
      font-size: 12px; font-weight: 600; cursor: pointer;
      font-family: 'Hanken Grotesk', sans-serif;
    }
    .notif-dropdown-body {
      max-height: 320px; overflow-y: auto;
    }
    .notif-empty {
      padding: 40px 20px; text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      color: var(--on-surface-variant); opacity: 0.6;
      font-size: 14px;
    }
    .notif-item {
      width: 100%; border: 0; text-align: left; font-family: inherit;
      display: flex; align-items: flex-start; gap: 12px;
      padding: 14px 20px; transition: background 0.15s; cursor: default;
    }
    .notif-item:hover { background: var(--surface-container-low); }
    .notif-item.unread { background: rgba(240, 80, 35, 0.04); }
    .notif-item-icon { color: var(--primary); font-size: 20px; flex-shrink: 0; margin-top: 2px; }
    .notif-item-content { flex: 1; min-width: 0; }
    .notif-item-msg {
      font-size: 13px; font-weight: 500; color: var(--on-surface); line-height: 1.4;
      overflow: hidden; text-overflow: ellipsis;
    }
    .notif-item-time {
      font-size: 11px; color: var(--on-surface-variant); opacity: 0.6; margin-top: 4px;
    }
  `]
})
export class TopbarComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  private router = inject(Router);
  public appState = inject(AppStateService);
  private authService = inject(AuthService);
  public notifService = inject(NotificationService);
  private ticketService = inject(TicketService);
  private areaService = inject(AreaService);
  private userService = inject(UserService);
  private routerSub?: Subscription;
  private searchTimer?: ReturnType<typeof setTimeout>;
  private searchRequest = 0;

  showUserMenu = signal(false);
  showNotifMenu = signal(false);
  showSearchResults = signal(false);
  searching = signal(false);
  searchTerm = signal('');
  searchResults = signal<SearchResult[]>([]);
  searchContext = signal<SearchContext>('none');
  searchPlaceholder = computed(() => ({
    tickets: 'Buscar por título, ID, estado o prioridad...',
    areas: 'Buscar áreas por nombre o descripción...',
    users: 'Buscar colaboradores por nombre o correo...',
    none: 'Búsqueda no disponible en esta sección'
  })[this.searchContext()]);
  contextLabel = computed(() => ({
    tickets: 'Tickets', areas: 'Áreas', users: 'Colaboradores', none: 'Resultados'
  })[this.searchContext()]);

  ngOnInit() {
    this.updateSearchContext(this.router.url);
    this.routerSub = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      this.updateSearchContext((event as NavigationEnd).urlAfterRedirects);
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  @HostListener('document:keydown', ['$event'])
  focusSearch(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && this.searchContext() !== 'none') {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.searchResults.set([]);
    this.showSearchResults.set(value.trim().length >= 2);
    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (value.trim().length < 2) {
      this.searching.set(false);
      return;
    }
    this.searchTimer = setTimeout(() => this.performSearch(value.trim()), 250);
  }

  onSearchFocus() {
    if (this.searchTerm().trim().length >= 2) this.showSearchResults.set(true);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.searchResults.set([]);
    this.showSearchResults.set(false);
    this.searchInput?.nativeElement.focus();
  }

  closeSearch() { this.showSearchResults.set(false); }

  openSearchResult(result: SearchResult) {
    this.closeSearch();
    this.searchTerm.set('');
    if (result.type === 'tickets') {
      this.router.navigate(['/app/tickets', result.id]);
    } else if (result.type === 'areas') {
      this.router.navigate(['/app/areas'], { queryParams: { search: result.title, focus: result.id } });
    } else {
      this.router.navigate(['/app/users'], { queryParams: { search: result.title, focus: result.id } });
    }
  }

  private updateSearchContext(url: string) {
    let context: SearchContext = 'none';
    if (url.startsWith('/app/tickets') || url.startsWith('/app/area-tickets')) context = 'tickets';
    else if (url.startsWith('/app/areas')) context = 'areas';
    else if (url.startsWith('/app/users')) context = 'users';
    this.searchContext.set(context);
    this.searchTerm.set('');
    this.searchResults.set([]);
    this.showSearchResults.set(false);
  }

  private performSearch(term: string) {
    const request = ++this.searchRequest;
    const normalized = term.toLocaleLowerCase('es');
    this.searching.set(true);
    const finish = (results: SearchResult[]) => {
      if (request !== this.searchRequest) return;
      this.searchResults.set(results.slice(0, 8));
      this.searching.set(false);
      this.showSearchResults.set(this.searchTerm().trim().length >= 2);
    };
    const fail = () => { if (request === this.searchRequest) { this.searching.set(false); this.searchResults.set([]); } };

    if (this.searchContext() === 'tickets') {
      this.ticketService.getAll(0, 200).subscribe({
        next: response => finish((response.content || []).filter(ticket => {
          const item = ticket as any;
          return [item.id, item.title, item.description, item.status, item.priority, item.areaName, item.assignedToName]
            .some(value => String(value || '').toLocaleLowerCase('es').includes(normalized));
        }).map(ticket => ({
          id: String(ticket.id), type: 'tickets' as const, title: ticket.title,
          subtitle: `#SD-${String(ticket.id).slice(0, 8)} · ${ticket.status || 'Sin estado'}`,
          badge: ticket.priority || 'Ticket'
        }))), error: fail
      });
    } else if (this.searchContext() === 'areas') {
      this.areaService.getAll().subscribe({
        next: response => finish((Array.isArray(response) ? response : []).filter(area =>
          [area.name, area.description].some(value => String(value || '').toLocaleLowerCase('es').includes(normalized))
        ).map(area => ({ id: String(area.id), type: 'areas' as const, title: area.name, subtitle: area.description || 'Sin descripción', badge: 'Área' }))),
        error: fail
      });
    } else if (this.searchContext() === 'users') {
      this.userService.getAll(0, 200).subscribe({
        next: response => finish((response.content || []).filter(user =>
          [user.name, user.email, user.role].some(value => String(value || '').toLocaleLowerCase('es').includes(normalized))
        ).map(user => ({ id: String(user.id), type: 'users' as const, title: user.name, subtitle: user.email, badge: this.formatRole(user.role) }))),
        error: fail
      });
    } else {
      finish([]);
    }
  }

  toggleNotifMenu(event: MouseEvent) {
    event.stopPropagation();
    this.showNotifMenu.set(!this.showNotifMenu());
    if (this.showNotifMenu()) {
      this.showUserMenu.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  closeMenusOnOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.showSearchResults() && !target.closest('.topbar-search')) {
      this.showSearchResults.set(false);
    }
    if (this.showNotifMenu() && !target.closest('.notif-container')) {
      this.showNotifMenu.set(false);
    }
    if (this.showUserMenu() && !target.closest('.topbar-user-container')) {
      this.showUserMenu.set(false);
    }
  }

  openNotification(notification: { id: string; ticketId?: string }) {
    this.notifService.markRead(notification.id);
    this.showNotifMenu.set(false);
    if (notification.ticketId) {
      this.router.navigate(['/app/tickets', notification.ticketId]);
    }
  }

  navigateToProfile() {
    this.showUserMenu.set(false);
    this.router.navigate(['/app/settings'], { queryParams: { tab: 'profile' } });
  }

  navigateToSettings() {
    this.showUserMenu.set(false);
    this.router.navigate(['/app/settings'], { queryParams: { tab: 'settings' } });
  }

  logout() {
    this.showUserMenu.set(false);
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  formatRole(role?: string): string {
    if (!role) return 'USUARIO';
    const cleanRole = role.replace('ROLE_', '');
    switch(cleanRole) {
      case 'ADMIN_TENANT': return 'ADMINISTRADOR';
      case 'COLABORADOR_RESOLUTOR': return 'RESOLUTOR';
      case 'COLABORADOR': return 'COLABORADOR';
      default: return cleanRole;
    }
  }
}
