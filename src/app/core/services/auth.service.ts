import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AppStateService, User } from '../state/app-state.service';
import { environment } from '../../../environments/environment'; // We'll create this later, fallback to hardcoded for now

export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  companyName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private appState = inject(AppStateService);
  
  // Replace with actual environment variable later
  private apiUrl = 'http://localhost:8080/api/v1/auth';

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  activate(token: string, companyName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/activate`, { token, companyName });
  }

  login(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('currentUser', JSON.stringify({ id: res.userId, name: res.name, email: res.email, role: res.role }));
          localStorage.setItem('currentTenant', JSON.stringify({ id: res.tenantId, subdomain: res.tenantId, name: res.companyName }));
          
          this.appState.setCurrentUser({ id: res.userId, name: res.name, email: res.email, role: res.role });
          this.appState.setCurrentTenant({ id: res.tenantId, subdomain: res.tenantId, name: res.companyName });
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentTenant');
    this.appState.setCurrentUser(null);
    this.appState.setCurrentTenant(null);
  }
}
