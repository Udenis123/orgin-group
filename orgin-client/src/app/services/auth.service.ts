import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize authentication state
    this.checkAuthStatus();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Check authentication status
  private checkAuthStatus(): void {
    const sessionCookie = this.getCookie('session');
    if (sessionCookie) {
      // Verify the session is still valid
      this.http.get(`${this.apiUrl}/auth/verify-session`, {
        withCredentials: true
      }).pipe(
        catchError(() => {
          this.isAuthenticatedSubject.next(false);
          return throwError(() => new Error('Session invalid'));
        })
      ).subscribe(() => {
        this.isAuthenticatedSubject.next(true);
      });
    } else {
      this.isAuthenticatedSubject.next(false);
    }
  }

  // Helper method to get cookie value
  private getCookie(name: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
    }
    return null;
  }

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

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.isAuthenticatedSubject.next(false);
      }),
      catchError(this.handleError)
    );
  }

  private handleError(response: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Something bad happened; please try again later.';

    if (response.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = 'Cannot connect to the server. Please check your internet connection.';
    } else {
      // Server-side error
      // Extract error message from backend response
      if (response.error?.message) {
        errorMessage = response.error.message;
      } else if (response.error?.error) {
        errorMessage = response.error.error;
      } else if (typeof response.error === 'string') {
        errorMessage = response.error;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}