import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyzerService {
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

  getAnalyzers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/analyzers`, {
      headers: this.getHeaders()
    });
  }

  registerAnalyzer(analyzerData: any): Observable<any> {
    // Transform the data to match backend expectations
    const transformedData = {
      name: analyzerData.name,
      email: analyzerData.email,
      phone: analyzerData.phoneNumber.replace(/\+/g, ''), // Remove + from country code
      expertise: analyzerData.expertise,
      nationality: analyzerData.nationality,
      gender: analyzerData.gender,
      nationalId: analyzerData.nationalId,
      password: analyzerData.password
    };

    return this.http.post(`${this.apiUrl}/admin/register/analyzer`, transformedData, {
      headers: this.getHeaders()
    });
  }
} 