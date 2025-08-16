import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  private apiUrl = environment.apiUrl + '/client/project';

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  bookmarkProject(
    userId: string,
    projectId: string
  ): Observable<HttpResponse<any>> {
    const token = this.cookieService.getCookie('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(`${this.apiUrl}/bookmark`, null, {
      headers,
      params: {
        userId,
        projectId,
      },
      observe: 'response',
    });
  }
}
