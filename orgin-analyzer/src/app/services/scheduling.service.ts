import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SchedulingService {
  private apiUrl = 'https://your-api-endpoint.com/scheduling';

  constructor(private http: HttpClient) {}

  getAdminSchedule(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin-schedule`);
  }

  scheduleAppointment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/schedule`, data);
  }

  getProjectDetails(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects/${projectId}`);
  }
} 