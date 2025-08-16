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

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/login`, credentials, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(response: HttpErrorResponse): Observable<never> {
    console.error('HTTP error occurred:', response);

    let errorMessage = 'Something bad happened; please try again later.';

    if (response.error instanceof ErrorEvent) {
      // Client-side error
      console.error('Client error:', response.error.message);
      errorMessage = 'Cannot connect to the server. Please check your internet connection.';
    } else {
      // Server-side error
      console.error(
        `Backend returned code ${response.status}, ` +
        `body was: ${JSON.stringify(response.error)}`
      );
      errorMessage = response.error?.message || errorMessage;
    }

    return throwError(() => new Error(errorMessage));
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

   // Request password reset code
   forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password/${email}`, {}, {
      withCredentials: true,
      responseType: 'text'  // Accept text response instead of JSON
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 200) {
          // Handle successful response that contains text instead of JSON
          return new Observable(observer => {
            observer.next({ message: error.error.text || "Password reset code sent" });
            observer.complete();
          });
        } else {
          return this.handleError(error);
        }
      })
    );
  }

   // Properly implement these methods that are referenced in verify-otp.component.ts
   verifyOTP(otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verify-otp`, { otp }, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  resendOTP(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/resend-otp`, { email }, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Verify reset code
  verifyResetCode(code: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/forgot/check/${code}`, {
      responseType: 'text',
      withCredentials: true
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 200) {
          // Handle successful response that contains text instead of JSON
          return new Observable(observer => {
            observer.next({ message: error.error.text || "Password reset code sent" });
            observer.complete();
          });
        } else {
          return this.handleError(error);
        }
      })
    );
  }

  // Reset password with email, code and new password
  resetPassword(resetData: {email: string, code: string, newPassword: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, resetData, {
      withCredentials: true,
      responseType: 'text'  // Add this to accept text responses
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 200) {
          // Handle successful text response
          return new Observable(observer => {
            observer.next({ message: error.error.text || "Password reset successfully" });
            observer.complete();
          });
        } else {
          return this.handleError(error);
        }
      })
    );
  }
}