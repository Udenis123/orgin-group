import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CookieService } from './cookie.service';

export interface Client {
  id: string;
  name: string;
  nationalId: string;
  gender: string;
  nationality: string;
  professional: string;
  email: string;
  phone: string;
  enabled: boolean;
  verificationCode: string | null;
  codeExpiryAt: string | null;
  roles: string[];
  subscribed: boolean;
  photoUrl: string;
  tempEmail: string | null;
  currentSubscription: string;
  active: boolean;
}

export interface UpdateClientRequest {
  id: string;
  professional?: string;
  phone?: string;
  name?: string;
  nationality?: string;
  profession?: string;
  nationalId?: string;
  gender?: string;
  phoneNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.cookieService.getCookie('adminToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/admin/all/clients`, {
      headers: this.getHeaders()
    });
  }

  getClientDetails(clientId: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/admin/client/${clientId}`, {
      headers: this.getHeaders()
    });
  }

  updateClient(updateData: UpdateClientRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/update/user`, updateData, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  toggleClientStatus(clientId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/activate/user?Id=${clientId}`, {}, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }
}
