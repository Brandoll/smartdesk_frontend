import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStateService } from '../state/app-state.service';

function hasUsableSession(): boolean {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('currentUser');
  const tenant = localStorage.getItem('currentTenant');
  if (!token || !user || !tenant) return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const encoded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded));
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function clearInvalidSession(appState: AppStateService): void {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('currentTenant');
  appState.setCurrentUser(null);
  appState.setCurrentTenant(null);
}

export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const appState = inject(AppStateService);
  if (hasUsableSession()) return true;

  clearInvalidSession(appState);
  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const appState = inject(AppStateService);
  if (!hasUsableSession()) {
    clearInvalidSession(appState);
    return router.createUrlTree(['/auth/login']);
  }

  const allowedRoles = (route.data?.['roles'] as string[] | undefined) || [];
  const role = appState.currentUser()?.role?.replace('ROLE_', '');
  if (role && allowedRoles.includes(role)) return true;
  return router.createUrlTree(['/app/tickets']);
};
