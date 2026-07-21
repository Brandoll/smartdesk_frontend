import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { tenantInterceptor } from './core/interceptors/tenant.interceptor';
import { mockInterceptor } from './core/interceptors/mock.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Descomenta el 'mockInterceptor' si el backend se vuelve a caer y necesitas el entorno local
    // provideHttpClient(withInterceptors([authInterceptor, tenantInterceptor, mockInterceptor])),
    provideHttpClient(withInterceptors([authInterceptor, tenantInterceptor])),
    provideAnimationsAsync()
  ]
};
