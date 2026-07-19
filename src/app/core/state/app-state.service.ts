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
  private readonly _theme = signal<'light' | 'dark'>('light');
  private readonly _isLoading = signal<boolean>(false);

  constructor() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this._currentUser.set(JSON.parse(savedUser));
    }
    const savedTenant = localStorage.getItem('currentTenant');
    if (savedTenant) {
      this._currentTenant.set(JSON.parse(savedTenant));
    }
  }

  // Computed properties for read-only access in templates
  public readonly currentUser = computed(() => this._currentUser());
  public readonly currentTenant = computed(() => this._currentTenant());
  public readonly theme = computed(() => this._theme());
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

  public setTheme(theme: 'light' | 'dark'): void {
    this._theme.set(theme);
  }

  public setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }
}
