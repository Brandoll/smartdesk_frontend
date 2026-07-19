import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserDTO {
  id?: string;
  name: string;
  email: string;
  role: string;
  status?: string;
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
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getAll(page: number = 0, size: number = 10): Observable<Page<UserDTO>> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<UserDTO>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/${id}`);
  }

  create(dto: UserDTO, tempPassword?: string): Observable<UserDTO> {
    let headers = new HttpHeaders();
    if (tempPassword) {
      headers = headers.set('X-Temp-Password', tempPassword);
    }
    return this.http.post<UserDTO>(this.apiUrl, dto, { headers });
  }

  update(id: string, dto: UserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/${id}`, dto);
  }
}
