import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AppStateService } from '../state/app-state.service';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const appState = inject(AppStateService);
  const tenant = appState.currentTenant();
  
  // If the backend expects X-Tenant-ID or if we need to send the subdomain
  if (tenant && tenant.id) {
    const cloned = req.clone({
      setHeaders: {
        'X-Tenant-ID': tenant.id
      }
    });
    return next(cloned);
  }
  
  return next(req);
};
