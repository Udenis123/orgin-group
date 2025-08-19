import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  signup(userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    

    
    return this.http.post(`${this.apiUrl}/auth/signup`, userData, { 
      headers: headers,
      withCredentials: true // Allow credentials to be sent with the request
    }).pipe(
      catchError(this.handleError)
    );
  }

  verifyEmail(code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verify/${code}`, {}, {
      withCredentials: true
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 200) {
          // Handle successful verification despite error callback
          return new Observable(observer => {
            observer.next(error.error);
            observer.complete();
          });
        } else {
          return this.handleError(error);
        }
      })
    );
  }

  resendVerificationCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/resend/${email}`, {}, {
      withCredentials: true
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 200) {
          // Handle successful resend despite error callback
          return new Observable(observer => {
            observer.next(error.error);
            observer.complete();
          });
        } else {
          return this.handleError(error);
        }
      })
    );
  }

  verifyOTP(otp: string) {
    return this.http.post('/api/verify-otp', { otp });
  }

  resendOTP(email: string) {
    return this.http.post('/api/resend-otp', { email });
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    // Format the request body to match LoginUserDto
    const loginData = {
      email: credentials.username, // Map username to email since we accept email in the form
      password: credentials.password
    };
    

    
    return this.http.post(`${this.apiUrl}/admin/login/admin`, loginData, { 
      headers: headers,
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(response: HttpErrorResponse) {
    console.error('HTTP error occurred:', response);
    
    if (response.error instanceof ErrorEvent) {
      // Client-side error
      console.error('Client error:', response.error.message);
    } else {
      // Server-side error
      console.error(
        `Backend returned code ${response.status}, ` +
        `body was: ${JSON.stringify(response.error)}`
      );
    }
    
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}