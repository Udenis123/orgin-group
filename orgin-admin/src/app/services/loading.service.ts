import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  showSpinner?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({
    isLoading: false,
    message: '',
    showSpinner: true
  });

  public loading$ = this.loadingSubject.asObservable();

  constructor() {}

  /**
   * Show loading state
   */
  show(message?: string, showSpinner: boolean = true): void {
    this.loadingSubject.next({
      isLoading: true,
      message: message || 'Loading...',
      showSpinner
    });
  }

  /**
   * Hide loading state
   */
  hide(): void {
    this.loadingSubject.next({
      isLoading: false,
      message: '',
      showSpinner: true
    });
  }

  /**
   * Update loading message
   */
  updateMessage(message: string): void {
    const currentState = this.loadingSubject.value;
    this.loadingSubject.next({
      ...currentState,
      message
    });
  }

  /**
   * Get current loading state
   */
  getCurrentState(): LoadingState {
    return this.loadingSubject.value;
  }

  /**
   * Check if currently loading
   */
  isLoading(): boolean {
    return this.loadingSubject.value.isLoading;
  }

  /**
   * Show loading with promise
   */
  async withLoading<T>(
    promise: Promise<T>,
    message?: string,
    showSpinner: boolean = true
  ): Promise<T> {
    try {
      this.show(message, showSpinner);
      const result = await promise;
      return result;
    } finally {
      this.hide();
    }
  }

  /**
   * Show loading with observable
   */
  withLoadingObservable<T>(
    observable: Observable<T>,
    message?: string,
    showSpinner: boolean = true
  ): Observable<T> {
    this.show(message, showSpinner);
    
    return new Observable(observer => {
      observable.subscribe({
        next: (value) => {
          observer.next(value);
        },
        error: (error) => {
          this.hide();
          observer.error(error);
        },
        complete: () => {
          this.hide();
          observer.complete();
        }
      });
    });
  }
}
