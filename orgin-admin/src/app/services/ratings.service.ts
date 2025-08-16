import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CookieService } from './cookie.service';

export interface Rating {
  id: number;
  userId: string;
  userName: string;
  userPhoto: string;
  message: string;
  starNumber: number;
  approved: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RatingsService {
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

  getRatings(): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/admin/ratings`, {
      headers: this.getHeaders()
    });
  }

  approveRating(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/ratings/approve/${id}`, {}, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  declineRating(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/ratings/decline/${id}`, {}, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }
} 