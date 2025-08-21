import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { ToastService } from './toast.service';
import { isPlatformBrowser } from '@angular/common';

export interface ProfileData {
  fullName: string;
  email: string;
  emailStatus: boolean;
  phone: string;
  profession: string;
  idNumber: string;
  gender: string;
  nationality: string;
  profilePicture: string;
  // Add any other profile fields as needed
}

@Injectable({
  providedIn: 'root'
})
export class ProfileCacheService {
  private profileSubject = new BehaviorSubject<ProfileData | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly FORCE_REFRESH_DURATION = 30 * 1000; // 30 seconds for force refresh

  public profile$: Observable<ProfileData | null> = this.profileSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize cache from localStorage if available
    this.initializeCacheFromStorage();
  }

  /**
   * Initialize cache from localStorage
   */
  private initializeCacheFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const cachedData = localStorage.getItem('profileCache');
        const cacheTimestamp = localStorage.getItem('profileCacheTimestamp');
        
        if (cachedData && cacheTimestamp) {
          const profile = JSON.parse(cachedData);
          const timestamp = parseInt(cacheTimestamp);
          const now = Date.now();
          
          // Check if cache is still valid (less than 5 minutes old)
          if (now - timestamp < this.CACHE_DURATION) {
            this.profileSubject.next(profile);
            this.lastFetchTime = timestamp;
          } else {
            // Cache is stale, clear it
            this.clearStorageCache();
          }
        }
      } catch (error) {
        console.error('Error loading profile cache from storage:', error);
        this.clearStorageCache();
      }
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveCacheToStorage(profile: ProfileData): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('profileCache', JSON.stringify(profile));
        localStorage.setItem('profileCacheTimestamp', Date.now().toString());
      } catch (error) {
        console.error('Error saving profile cache to storage:', error);
      }
    }
  }

  /**
   * Clear cache from localStorage
   */
  private clearStorageCache(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem('profileCache');
        localStorage.removeItem('profileCacheTimestamp');
      } catch (error) {
        console.error('Error clearing profile cache from storage:', error);
      }
    }
  }

  /**
   * Get profile data with caching
   * @param forceRefresh Force refresh the cache
   * @returns Observable of profile data
   */
  getProfile(forceRefresh: boolean = false): Observable<ProfileData | null> {
    const now = Date.now();
    const cachedProfile = this.profileSubject.value;
    const timeSinceLastFetch = now - this.lastFetchTime;

    // Return cached data if it's still valid and not forcing refresh
    if (cachedProfile && !forceRefresh && timeSinceLastFetch < this.CACHE_DURATION) {
      return of(cachedProfile);
    }

    // If we're already loading, return the current loading state
    if (this.isLoadingSubject.value) {
      return this.profile$;
    }

    // Fetch fresh data
    this.isLoadingSubject.next(true);
    
         return this.userService.getProfileDetails().pipe(
       tap((profile: ProfileData) => {
         this.profileSubject.next(profile);
         this.lastFetchTime = now;
         this.isLoadingSubject.next(false);
         // Save to localStorage for persistence across reloads
         this.saveCacheToStorage(profile);
       }),
      catchError((error) => {
        this.isLoadingSubject.next(false);
        this.toastService.showError('Failed to load profile data');
        // Return cached data if available, otherwise throw error
        if (cachedProfile) {
          return of(cachedProfile);
        }
        throw error;
      })
    );
  }

  /**
   * Update profile data in cache
   * @param updatedProfile Updated profile data
   */
  updateProfile(updatedProfile: Partial<ProfileData>): void {
    const currentProfile = this.profileSubject.value;
    if (currentProfile) {
      const newProfile = { ...currentProfile, ...updatedProfile };
      this.profileSubject.next(newProfile);
      this.lastFetchTime = Date.now();
      // Update localStorage cache
      this.saveCacheToStorage(newProfile);
    }
  }

  /**
   * Clear the cache and force refresh on next request
   */
  invalidateCache(): void {
    this.profileSubject.next(null);
    this.lastFetchTime = 0;
    // Clear localStorage cache
    this.clearStorageCache();
  }

  /**
   * Refresh profile data (alias for getProfile with force refresh)
   */
  refreshProfile(): Observable<ProfileData | null> {
    return this.getProfile(true);
  }

  /**
   * Get current cached profile data synchronously
   */
  getCurrentProfile(): ProfileData | null {
    return this.profileSubject.value;
  }

  /**
   * Check if we have cached data available immediately
   */
  hasCachedData(): boolean {
    return this.profileSubject.value !== null && !this.isCacheStale();
  }

  /**
   * Get cached data immediately if available (for fast initial loading)
   */
  getCachedDataImmediately(): ProfileData | null {
    if (this.hasCachedData()) {
      return this.profileSubject.value;
    }
    return null;
  }

  /**
   * Check if cache is stale
   */
  isCacheStale(): boolean {
    const now = Date.now();
    return now - this.lastFetchTime > this.CACHE_DURATION;
  }

  /**
   * Check if we should force refresh (for critical updates)
   */
  shouldForceRefresh(): boolean {
    const now = Date.now();
    return now - this.lastFetchTime > this.FORCE_REFRESH_DURATION;
  }

  /**
   * Update profile picture in cache
   */
  updateProfilePicture(pictureUrl: string): void {
    this.updateProfile({ profilePicture: pictureUrl });
  }

  /**
   * Update email verification status
   */
  updateEmailStatus(isVerified: boolean): void {
    this.updateProfile({ emailStatus: isVerified });
  }
}
