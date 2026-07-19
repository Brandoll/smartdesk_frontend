import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AreaDTO {
  id?: string;
  name: string;
  description: string;
  tenantId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AreaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/areas`;

  getAll(): Observable<AreaDTO[]> {
    return this.http.get<AreaDTO[]>(this.apiUrl);
  }

  getById(id: string): Observable<AreaDTO> {
    return this.http.get<AreaDTO>(`${this.apiUrl}/${id}`);
  }

  create(dto: AreaDTO): Observable<AreaDTO> {
    return this.http.post<AreaDTO>(this.apiUrl, dto);
  }

  update(id: string, dto: AreaDTO): Observable<AreaDTO> {
    return this.http.put<AreaDTO>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
