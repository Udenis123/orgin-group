import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Feedback } from '../models/feedback.interface';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private showFeedbackSubject = new BehaviorSubject<boolean>(false);
  showFeedback$ = this.showFeedbackSubject.asObservable();
  private apiUrl = environment.apiUrl;
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      if (this.canShowFeedback()) {
        this.checkAndShowPopup();
      }
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getTokenFromCookie();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private getTokenFromCookie(): string | null {
    if (!this.isBrowser) return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  // Made public so it can be called from app component
  checkAndShowPopup(): void {
    if (!this.isBrowser) return;

    if (this.canShowFeedback()) {
      this.checkIfUserHasRated().subscribe(hasRated => {
        if (!hasRated) {
          this.showFeedbackPopup();
        }
      });
    }
  }

  private canShowFeedback(): boolean {
    if (!this.isBrowser) return false;
    
    // Check if user is logged in
    if (!this.authService.isAuthenticated()) {
      return false;
    }
    
    return true;
  }

  showFeedbackPopup() {
    if (this.isBrowser && this.canShowFeedback()) {
      this.showFeedbackSubject.next(true);
    }
  }

  hideFeedbackPopup() {
    this.showFeedbackSubject.next(false);
  }

  submitFeedback(rating: number, feedback: string): Observable<Feedback> {
    const userId = this.getUserIdFromCookie();
    if (!userId) {
      console.error('No userId found in cookies');
      return throwError(() => new Error('No userId found in cookies'));
    }

    const token = this.getTokenFromCookie();
    if (!token) {
      console.error('No authentication token found');
      return throwError(() => new Error('No authentication token found'));
    }

    const feedbackData = {
      stars: rating,
      message: feedback,
      userId: userId
    };

    return this.http.post(`${this.apiUrl}/client/ratting`, feedbackData, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }).pipe(
      tap(() => this.hideFeedbackPopup()),
      map(() => ({
        id: Date.now().toString(),
        rating: rating,
        feedback: feedback,
        userId: userId,
        createdAt: new Date(),
        page: this.router.url
      })),
      catchError(error => {
        console.error('Error submitting feedback:', error);
        return throwError(() => error);
      })
    );
  }

  private checkIfUserHasRated(): Observable<boolean> {
    const userId = this.getUserIdFromCookie();
    if (!userId) {
      console.error('No userId found in cookies');
      return of(false);
    }

    const token = this.getTokenFromCookie();
    if (!token) {
      console.error('No authentication token found');
      return of(false);
    }

    return this.http.get<boolean>(`${this.apiUrl}/client/has-rated`, {
      params: { userId: userId },
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error checking if user has rated:', error);
        return of(false);
      })
    );
  }

  private getUserIdFromCookie(): string | null {
    if (!this.isBrowser) return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; userId=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  // Method to force show popup (can be called from anywhere)
  forceShowPopup(): void {
    if (this.isBrowser && this.canShowFeedback()) {
      this.showFeedbackPopup();
    }
  }

  // Method to reset feedback status (for testing)
  resetFeedbackStatus(): void {
    if (!this.isBrowser) return;
    // Since we're using backend now, this method is kept for compatibility
    // but doesn't need to do anything as the status is managed by the backend
    console.log('Feedback status is now managed by the backend');
  }
} 