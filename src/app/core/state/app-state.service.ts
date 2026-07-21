import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Tenant {
  id: string;
  subdomain: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  
  // Signals
  private readonly _currentUser = signal<User | null>(null);
  private readonly _currentTenant = signal<Tenant | null>(null);
  private readonly _isLoading = signal<boolean>(false);

  constructor() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try { this._currentUser.set(JSON.parse(savedUser)); } catch { localStorage.removeItem('currentUser'); }
    }
    const savedTenant = localStorage.getItem('currentTenant');
    if (savedTenant) {
      try { this._currentTenant.set(JSON.parse(savedTenant)); } catch { localStorage.removeItem('currentTenant'); }
    }
  }

  // Computed properties for read-only access in templates
  public readonly currentUser = computed(() => this._currentUser());
  public readonly currentTenant = computed(() => this._currentTenant());
  public readonly isLoading = computed(() => this._isLoading());

  public readonly isAuthenticated = computed(() => this._currentUser() !== null);
  public readonly hasTenant = computed(() => this._currentTenant() !== null);

  // Actions
  public setCurrentUser(user: User | null): void {
    this._currentUser.set(user);
  }

  public setCurrentTenant(tenant: Tenant | null): void {
    this._currentTenant.set(tenant);
  }

  public setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }
}
