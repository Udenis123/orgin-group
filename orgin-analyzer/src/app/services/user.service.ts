import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userData: any;
  private profileCache: any = null;
  private profileCacheTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly BACKGROUND_REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutes for background refresh
  private readonly STORAGE_KEY = 'orgin_profile_cache';
  private readonly STORAGE_TIME_KEY = 'orgin_profile_cache_time';
  private readonly STORAGE_LAST_SYNC_KEY = 'orgin_profile_last_sync';
  private profileSubject = new BehaviorSubject<any>(null);
  private backgroundRefreshSubscription: any = null;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadUserData();
    this.loadCachedProfile();
    this.startBackgroundRefresh();
  }

  private startBackgroundRefresh() {
    if (isPlatformBrowser(this.platformId)) {
      // Start background refresh every 2 minutes
      this.backgroundRefreshSubscription = timer(0, this.BACKGROUND_REFRESH_INTERVAL)
        .pipe(
          switchMap(() => this.silentRefreshProfile())
        )
        .subscribe();
    }
  }

  private silentRefreshProfile(): Observable<any> {
    // Only refresh if we have valid authentication
    const token = this.cookieService.get('analyzerToken');
    const userId = this.cookieService.get('analyzerUserId');

    if (!token || !userId) {
      return of(null);
    }

    return this.http.get<{
        plan: string,
        status: string,
        fullName: string,
        email: string,
        emailStatus: boolean,
        phone: string,
        idNumber: string,
        gender: string,
        nationality: string,
        profession: string,
        profilePicture: string
    }>(`${environment.apiUrl}/client/profile`, {
        params: { userId: userId },
        headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
        tap(profile => {
            // Only update if data has changed
            if (this.hasProfileChanged(profile)) {
                this.profileCache = profile;
                this.profileCacheTime = Date.now();
                this.saveProfileToStorage(profile);
                this.profileSubject.next(profile);
                console.log('Profile updated via background refresh');
            }
        }),
        catchError(error => {
            console.error('Background refresh failed:', error);
            return of(null);
        })
    );
  }

  private hasProfileChanged(newProfile: any): boolean {
    if (!this.profileCache) return true;
    
    // Compare key fields that might change
    const fieldsToCompare = ['fullName', 'email', 'phone', 'idNumber', 'gender', 'nationality', 'profession', 'profilePicture'];
    
    return fieldsToCompare.some(field => {
      const oldValue = this.profileCache[field];
      const newValue = newProfile[field];
      return oldValue !== newValue;
    });
  }

  private loadCachedProfile() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const cachedData = localStorage.getItem(this.STORAGE_KEY);
        const cachedTime = localStorage.getItem(this.STORAGE_TIME_KEY);
        
        if (cachedData && cachedTime) {
          const cacheTime = parseInt(cachedTime);
          const now = Date.now();
          
          // Check if cache is still valid (5 minutes)
          if ((now - cacheTime) < this.CACHE_DURATION) {
            this.profileCache = JSON.parse(cachedData);
            this.profileCacheTime = cacheTime;
            this.profileSubject.next(this.profileCache);
          } else {
            // Clear expired cache
            this.clearProfileCache();
          }
        }
      } catch (error) {
        console.error('Error loading cached profile:', error);
        this.clearProfileCache();
      }
    }
  }

  private saveProfileToStorage(profile: any) {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
        localStorage.setItem(this.STORAGE_TIME_KEY, Date.now().toString());
        localStorage.setItem(this.STORAGE_LAST_SYNC_KEY, Date.now().toString());
      } catch (error) {
        console.error('Error saving profile to storage:', error);
      }
    }
  }

  getProfileDetails(): Observable<any> {
    const now = Date.now();
    
    // Check if we have valid cached data
    if (this.profileCache && (now - this.profileCacheTime) < this.CACHE_DURATION) {
      // Return cached data immediately, but also trigger a background refresh
      this.triggerBackgroundRefresh();
      return of(this.profileCache);
    }

    const token = this.cookieService.get('analyzerToken');
    const userId = this.cookieService.get('analyzerUserId');

    if (!token || !userId) {
        throw new Error('Authentication data not found');
    }

    return this.http.get<{
        plan: string,
        status: string,
        fullName: string,
        email: string,
        emailStatus: boolean,
        phone: string,
        idNumber: string,
        gender: string,
        nationality: string,
        profession: string,
        profilePicture: string
    }>(`${environment.apiUrl}/client/profile`, {
        params: {
            userId: userId
        },
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).pipe(
        tap(profile => {
            // Cache the profile data
            this.profileCache = profile;
            this.profileCacheTime = now;
            this.saveProfileToStorage(profile);
            this.profileSubject.next(profile);
        }),
        catchError(error => {
            console.error('Error fetching profile:', error);
            throw error;
        })
    );
  }

  // Trigger immediate background refresh
  private triggerBackgroundRefresh() {
    if (isPlatformBrowser(this.platformId)) {
      const lastSync = localStorage.getItem(this.STORAGE_LAST_SYNC_KEY);
      const now = Date.now();
      
      // Only refresh if it's been more than 30 seconds since last sync
      if (!lastSync || (now - parseInt(lastSync)) > 30000) {
        this.silentRefreshProfile().subscribe();
      }
    }
  }

  // Get cached profile data without making API call
  getCachedProfile(): any {
    return this.profileCache;
  }

  // Get profile as observable (returns cached data if available)
  getProfileObservable(): Observable<any> {
    return this.profileSubject.asObservable();
  }

  // Clear cache (useful for logout or when data needs refresh)
  clearProfileCache(): void {
    this.profileCache = null;
    this.profileCacheTime = 0;
    this.profileSubject.next(null);
    
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.STORAGE_TIME_KEY);
        localStorage.removeItem(this.STORAGE_LAST_SYNC_KEY);
      } catch (error) {
        console.error('Error clearing profile cache from storage:', error);
      }
    }
  }

  // Force refresh profile data
  refreshProfile(): Observable<any> {
    this.clearProfileCache();
    return this.getProfileDetails();
  }

  // Preload profile data for immediate availability
  preloadProfile(): Observable<any> {
    // If we have cached data, return it immediately
    if (this.profileCache) {
      // Trigger background refresh for data freshness
      this.triggerBackgroundRefresh();
      return of(this.profileCache);
    }

    // If we have stored data but not in memory, load it
    if (isPlatformBrowser(this.platformId)) {
      try {
        const cachedData = localStorage.getItem(this.STORAGE_KEY);
        const cachedTime = localStorage.getItem(this.STORAGE_TIME_KEY);
        
        if (cachedData && cachedTime) {
          const cacheTime = parseInt(cachedTime);
          const now = Date.now();
          
          if ((now - cacheTime) < this.CACHE_DURATION) {
            this.profileCache = JSON.parse(cachedData);
            this.profileCacheTime = cacheTime;
            this.profileSubject.next(this.profileCache);
            // Trigger background refresh for data freshness
            this.triggerBackgroundRefresh();
            return of(this.profileCache);
          }
        }
      } catch (error) {
        console.error('Error loading cached profile:', error);
      }
    }

    // If no cached data, fetch from API
    return this.getProfileDetails();
  }

  // Stop background refresh (call on logout)
  stopBackgroundRefresh(): void {
    if (this.backgroundRefreshSubscription) {
      this.backgroundRefreshSubscription.unsubscribe();
      this.backgroundRefreshSubscription = null;
    }
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
    return this.http.put('/api/update-user', userData);
  }
  uploadProfileImage(file: File, userId: string) {
    const token = this.cookieService.get('analyzerToken');
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
        tap(() => {
            // Refresh profile cache after successful upload
            this.refreshProfile().subscribe();
        })
    );
  }

  updatePassword(oldPassword: string, newPassword: string) {
    const token = this.cookieService.get('analyzerToken');
    const userId = this.cookieService.get('analyzerUserId');

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
    });
  }

  // Manual refresh method for immediate updates
  manualRefresh(): Observable<any> {
    console.log('Manual profile refresh triggered');
    return this.refreshProfile();
  }

  // Get last sync time for debugging
  getLastSyncTime(): number | null {
    if (isPlatformBrowser(this.platformId)) {
      const lastSync = localStorage.getItem(this.STORAGE_LAST_SYNC_KEY);
      return lastSync ? parseInt(lastSync) : null;
    }
    return null;
  }

}