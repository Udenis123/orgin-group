import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from './cookie.service';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';

interface ProfileData {
  plan: string;
  status: string;
  fullName: string;
  email: string;
  emailStatus: boolean;
  phone: string;
  idNumber: string;
  gender: string;
  nationality: string;
  profession: string;
  profilePicture: string;
}

interface CachedProfile {
  data: ProfileData;
  timestamp: number;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userData: any;
  private profileCache: CachedProfile | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly CACHE_KEY = 'profileCache';
  
  // BehaviorSubject to emit profile updates
  private profileSubject = new BehaviorSubject<ProfileData | null>(null);
  public profile$ = this.profileSubject.asObservable();

  // Loading state management
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  // Profile ready state (has been fetched at least once)
  private profileReadySubject = new BehaviorSubject<boolean>(false);
  public profileReady$ = this.profileReadySubject.asObservable();

  constructor(
    private http: HttpClient, 
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadUserData();
    this.loadCachedProfile();
    
    // Check if we have cached data on initialization
    const cachedData = this.getCachedProfile();
    if (cachedData) {
      this.profileSubject.next(cachedData);
      this.profileReadySubject.next(true);
    }
  }

  /**
   * Get profile details with smart caching
   * Returns cached data immediately if available and fresh, then fetches updated data
   */
  getProfileDetails(): Observable<ProfileData> {
    const token = this.cookieService.getCookie('adminToken');
    const userId = this.cookieService.getCookie('adminId');

    if (!token || !userId) {
      return throwError(() => new Error('Authentication data not found'));
    }

    // Set loading state
    this.loadingSubject.next(true);

    // Check if we have valid cached data
    const cachedData = this.getValidCachedProfile(userId);
    
    if (cachedData) {
      // Return cached data immediately
      this.profileSubject.next(cachedData);
      this.profileReadySubject.next(true);
      this.loadingSubject.next(false);
      
      // Fetch fresh data in background and update if different
      return this.fetchFreshProfile(token, userId).pipe(
        tap(freshData => {
          if (this.hasProfileChanged(cachedData, freshData)) {
            this.profileSubject.next(freshData);
          }
        }),
        switchMap(() => of(cachedData)) // Return cached data for immediate use
      );
    } else {
      // No valid cache, fetch fresh data
      return this.fetchFreshProfile(token, userId);
    }
  }

  /**
   * Force refresh profile data (bypasses cache)
   */
  refreshProfile(): Observable<ProfileData> {
    const token = this.cookieService.getCookie('adminToken');
    const userId = this.cookieService.getCookie('adminId');

    if (!token || !userId) {
      return throwError(() => new Error('Authentication data not found'));
    }

    // Set loading state
    this.loadingSubject.next(true);

    // Clear cache before fetching fresh data
    this.clearProfileCache();
    return this.fetchFreshProfile(token, userId);
  }

  /**
   * Manually refresh profile data and update cache
   */
  forceRefreshProfile(): Observable<ProfileData> {
    return this.refreshProfile();
  }

  /**
   * Clear profile cache
   */
  clearProfileCache(): void {
    this.profileCache = null;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.CACHE_KEY);
    }
  }

  /**
   * Invalidate cache when profile is updated
   */
  invalidateProfileCache(): void {
    this.clearProfileCache();
  }

  /**
   * Get current cached profile data without making API call
   * Returns null if no valid cache exists
   */
  getCachedProfile(): ProfileData | null {
    const userId = this.cookieService.getCookie('adminId');
    if (!userId) {
      return null;
    }
    return this.getValidCachedProfile(userId);
  }

  /**
   * Check if profile cache is valid and not expired
   */
  isProfileCacheValid(): boolean {
    const userId = this.cookieService.getCookie('adminId');
    if (!userId) {
      return false;
    }
    return this.getValidCachedProfile(userId) !== null;
  }

  /**
   * Get cache expiration time in milliseconds
   */
  getCacheExpirationTime(): number {
    if (!this.profileCache) {
      return 0;
    }
    return this.profileCache.timestamp + this.CACHE_DURATION;
  }

  /**
   * Get remaining cache time in milliseconds
   */
  getRemainingCacheTime(): number {
    const expirationTime = this.getCacheExpirationTime();
    if (expirationTime === 0) {
      return 0;
    }
    return Math.max(0, expirationTime - Date.now());
  }

  /**
   * Check if profile data is ready (has been fetched at least once)
   */
  isProfileReady(): boolean {
    return this.profileReadySubject.value;
  }

  /**
   * Get current loading state
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  private fetchFreshProfile(token: string, userId: string): Observable<ProfileData> {
    return this.http.get<ProfileData>(`${environment.apiUrl}/client/profile`, {
      params: { userId: userId },
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap(profileData => {
        // Cache the fresh data
        this.cacheProfile(profileData, userId);
        this.profileSubject.next(profileData);
        this.profileReadySubject.next(true);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error fetching profile:', error);
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  private getValidCachedProfile(userId: string): ProfileData | null {
    if (!this.profileCache) {
      return null;
    }

    // Check if cache is for the same user
    if (this.profileCache.userId !== userId) {
      this.clearProfileCache();
      return null;
    }

    // Check if cache is still valid (not expired)
    const now = Date.now();
    if (now - this.profileCache.timestamp > this.CACHE_DURATION) {
      this.clearProfileCache();
      return null;
    }

    return this.profileCache.data;
  }

  private cacheProfile(profileData: ProfileData, userId: string): void {
    this.profileCache = {
      data: profileData,
      timestamp: Date.now(),
      userId: userId
    };

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.profileCache));
    }
  }

  private loadCachedProfile(): void {
    if (isPlatformBrowser(this.platformId)) {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        try {
          this.profileCache = JSON.parse(cached);
        } catch (error) {
          console.error('Error parsing cached profile:', error);
          this.clearProfileCache();
        }
      }
    }
  }

  private hasProfileChanged(oldProfile: ProfileData, newProfile: ProfileData): boolean {
    return JSON.stringify(oldProfile) !== JSON.stringify(newProfile);
  }

  uploadProfileImage(file: File, userId: string) {
    const token = this.cookieService.getCookie('adminToken');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    if (!token) {
        throw new Error('No authentication token found');
    }

    return this.http.post<{ fileUrl: string }>(`${environment.apiUrl}/client/upload-photo`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).pipe(
      tap(response => {
        // Invalidate cache when profile image is updated
        this.invalidateProfileCache();
      })
    );
  }

  updatePassword(oldPassword: string, newPassword: string) {
    const token = this.cookieService.getCookie('adminToken');
    const userId = this.cookieService.getCookie('adminId');

    if (!token || !userId) {
      throw new Error('Authentication data not found');
    }

    const changePasswordDto = {
      userId: userId,
      oldPassword: oldPassword,
      newPassword: newPassword
    };

    return this.http.put(`${environment.apiUrl}/client/update-password`, changePasswordDto, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      tap(() => {
        // Invalidate cache when password is updated
        this.invalidateProfileCache();
      })
    );
  }

  getUserData() {
    return this.userData;
  }

  setUserData(data: any) {
    this.userData = data;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('userData', JSON.stringify(data));
    }
  }

  private loadUserData() {
    if (isPlatformBrowser(this.platformId)) {
      const storedData = localStorage.getItem('userData');
      if (storedData) {
        this.userData = JSON.parse(storedData);
      }
    }
  }

  sendVerificationEmail(email: string) {
    // Replace with your actual API endpoint
    return this.http.post('/api/send-verification-email', { email });
  }

  updateUserData(userData: any) {
    // Replace with your actual API endpoint
    return this.http.put('/api/update-user', userData).pipe(
      tap(() => {
        // Invalidate cache when user data is updated
        this.invalidateProfileCache();
      })
    );
  }
}
