import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardMetrics {
  totalTickets: number;
  activeTickets: number;
  resolvedTickets: number;
  unassignedTickets: number;
  criticalTickets: number;
  highPriorityTickets: number;
  resolutionRate: number;
  averageResolutionHours: number;
  totalUsers: number;
  totalAreas: number;
  ticketsByStatus: Record<string, number>;
  ticketsByPriority: Record<string, number>;
  areaWorkload: Array<{ name: string; count: number }>;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/metrics`);
  }
}
