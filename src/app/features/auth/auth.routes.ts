import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './auth-layout.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { 
        path: 'login', 
        loadComponent: () => import('./login/login.component').then(c => c.LoginComponent)
      },
      { 
        path: 'register', 
        loadComponent: () => import('./register/register.component').then(c => c.RegisterComponent)
      },
      { 
        path: 'verify', 
        loadComponent: () => import('./verify/verify.component').then(c => c.VerifyComponent)
      }
    ]
  }
];
