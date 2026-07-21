import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'app',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('./app-shell/layout.component').then(c => c.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', canActivate: [roleGuard], data: { roles: ['ADMIN_TENANT'] }, loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
      { path: 'tickets', loadComponent: () => import('./features/ticket-list/ticket-list.component').then(c => c.TicketListComponent) },
      { path: 'tickets/new', loadComponent: () => import('./features/tickets/ticket-new.component').then(c => c.TicketNewComponent) },
      { path: 'tickets/:id', loadComponent: () => import('./features/tickets/ticket-detail.component').then(c => c.TicketDetailComponent) },
      { path: 'users', canActivate: [roleGuard], data: { roles: ['ADMIN_TENANT'] }, loadComponent: () => import('./features/users/users.component').then(c => c.UsersComponent) },
      { path: 'areas', canActivate: [roleGuard], data: { roles: ['ADMIN_TENANT'] }, loadComponent: () => import('./features/areas/areas.component').then(c => c.AreasComponent) },
      { path: 'area-tickets', canActivate: [roleGuard], data: { roles: ['ADMIN_TENANT', 'COLABORADOR_RESOLUTOR'] }, loadComponent: () => import('./features/area-tickets/area-tickets.component').then(c => c.AreaTicketsComponent) },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(c => c.SettingsComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(c => c.ProfileComponent) }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];
