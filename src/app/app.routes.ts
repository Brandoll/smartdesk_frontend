import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'app',
    loadComponent: () => import('./app-shell/layout.component').then(c => c.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
      { path: 'tickets', loadComponent: () => import('./features/ticket-list/ticket-list.component').then(c => c.TicketListComponent) },
      { path: 'tickets/new', loadComponent: () => import('./features/tickets/ticket-new.component').then(c => c.TicketNewComponent) },
      { path: 'tickets/:id', loadComponent: () => import('./features/tickets/ticket-detail.component').then(c => c.TicketDetailComponent) },
      { path: 'users', loadComponent: () => import('./features/users/users.component').then(c => c.UsersComponent) },
      { path: 'areas', loadComponent: () => import('./features/areas/areas.component').then(c => c.AreasComponent) },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(c => c.SettingsComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(c => c.ProfileComponent) }
    ]
  }
];
