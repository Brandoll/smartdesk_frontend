import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TicketDTO {
  id?: string;
  title: string;
  description: string;
  status?: string;
  priority?: string;
  clientId?: string;
  assignedToId?: string | null;
  areaId?: string;
  aiSuggestedTitle?: string;
  aiSuggestedAreaId?: string;
  aiSuggestedPriority?: string;
  aiClassified?: boolean;
  resolutionComment?: string;
  rating?: number;
  ratingComment?: string;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tickets`;

  getAll(page: number = 0, size: number = 10): Observable<Page<TicketDTO>> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<TicketDTO>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<TicketDTO> {
    return this.http.get<TicketDTO>(`${this.apiUrl}/${id}`);
  }

  create(dto: TicketDTO): Observable<TicketDTO> {
    return this.http.post<TicketDTO>(this.apiUrl, dto);
  }

  update(id: string, dto: Partial<TicketDTO>): Observable<TicketDTO> {
    return this.http.put<TicketDTO>(`${this.apiUrl}/${id}`, dto);
  }

  getHistory(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/history`);
  }

  getMessages(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/messages`);
  }

  sendMessage(ticketId: string, message: string, isInternal: boolean = false): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${ticketId}/messages`, { message, isInternal });
  }
}
