# Profile Caching & Loading System

This document explains the smart caching mechanism and loading state system implemented for user profile data in the admin application.

## Overview

The system provides:
- **Immediate data access** on page reload using cached data
- **Background updates** to fetch fresh data when available
- **Automatic cache invalidation** when profile data changes
- **Cache expiration** to ensure data freshness
- **Loading states** that prevent pages from showing until data is ready
- **Smart loading indicators** with customizable messages

## How It Works

### 1. Smart Caching Strategy

When `getProfileDetails()` is called:

1. **Check Cache**: First checks if valid cached data exists (not expired, same user)
2. **Return Cached Data**: If valid cache exists, returns it immediately
3. **Background Fetch**: Fetches fresh data from API in the background
4. **Update if Changed**: If fresh data differs from cached data, updates the UI
5. **Cache Fresh Data**: Stores the fresh data in cache for future use

### 2. Loading State Management

The system prevents pages from displaying until profile data is ready:

1. **Initial Load**: Shows loading spinner until profile data is fetched
2. **Cache Hit**: Shows cached data immediately, fetches fresh data in background
3. **Cache Miss**: Shows loading spinner while fetching from API
4. **Error Handling**: Shows fallback data if API fails

### 3. Cache Management

- **Cache Duration**: 5 minutes (configurable via `CACHE_DURATION`)
- **Storage**: LocalStorage for persistence across browser sessions
- **User-specific**: Cache is tied to specific user ID
- **Automatic Cleanup**: Expired cache is automatically cleared

### 4. Cache Invalidation

Cache is automatically invalidated when:
- Profile image is uploaded
- Password is updated
- User data is updated
- Cache expires (5 minutes)
- Different user logs in

## Loading State System

### Components with Loading States

1. **Dashboard Component**: Shows fullscreen loading until profile is ready
2. **Navbar Component**: Shows loading state in username area
3. **Sidenav Component**: Shows loading state in profile section
4. **Profile Component**: Shows loading state in profile details

### Loading State Flow

```
Page Load → Check Cache → Show Loading → Fetch Data → Hide Loading → Show Content
     ↓
Cache Hit → Show Cached Data → Background Fetch → Update if Changed
```

## Usage in Components

### Basic Usage with Loading States

```typescript
export class MyComponent implements OnInit, OnDestroy {
  private profileSubscription: Subscription | null = null;
  private loadingSubscription: Subscription | null = null;
  private readySubscription: Subscription | null = null;
  
  isProfileReady = false;
  isLoading = false;
  userProfile: any = null;

  constructor(private userService: UserService) {}

  ngOnInit() {
    // Subscribe to profile ready state
    this.readySubscription = this.userService.profileReady$.subscribe(ready => {
      this.isProfileReady = ready;
    });

    // Subscribe to loading state
    this.loadingSubscription = this.userService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });

    // Subscribe to profile updates
    this.profileSubscription = this.userService.profile$.subscribe(profile => {
      if (profile) {
        this.userProfile = profile;
      }
    });

    // Fetch profile data if not already ready
    if (!this.userService.isProfileReady()) {
      this.userService.getProfileDetails().subscribe({
        next: (profile) => {
          this.userProfile = profile;
        },
        error: (err) => {
          console.error('Failed to fetch profile:', err);
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
    if (this.readySubscription) {
      this.readySubscription.unsubscribe();
    }
  }
}
```

### Template with Loading States

```html
<!-- Show loading state until profile is ready -->
<div *ngIf="!isProfileReady || isLoading" class="loading-container">
  <app-loading 
    [fullscreen]="true" 
    [message]="'Loading your profile...'">
  </app-loading>
</div>

<!-- Show content only when profile is ready -->
<div *ngIf="isProfileReady && !isLoading" class="content-container">
  <h1>Welcome, {{ userProfile?.fullName }}</h1>
  <!-- Your content here -->
</div>
```

### Using Loading Service

```typescript
export class MyComponent {
  constructor(
    private userService: UserService,
    private loadingService: LoadingService
  ) {}

  async loadData() {
    // Show loading with custom message
    this.loadingService.show('Loading user data...');
    
    try {
      const data = await this.userService.getProfileDetails().toPromise();
      // Handle data
    } finally {
      this.loadingService.hide();
    }
  }

  // Or use the convenience method
  async loadDataWithLoading() {
    const data = await this.loadingService.withLoading(
      this.userService.getProfileDetails().toPromise(),
      'Loading user data...'
    );
    // Handle data
  }
}
```

## Force Refresh

```typescript
// Force refresh (bypasses cache)
this.userService.refreshProfile().subscribe({
  next: (profile) => {
    // Fresh data from API
  }
});
```

## Check Cache Status

```typescript
// Check if cache is valid
const isValid = this.userService.isProfileCacheValid();

// Get cached data without API call
const cachedProfile = this.userService.getCachedProfile();

// Get remaining cache time
const remainingTime = this.userService.getRemainingCacheTime();

// Check if profile is ready
const isReady = this.userService.isProfileReady();

// Check if currently loading
const isLoading = this.userService.isLoading();
```

## Benefits

1. **Faster Page Loads**: No waiting for API calls on reload
2. **Better UX**: Immediate data display with background updates
3. **Reduced API Calls**: Minimizes unnecessary network requests
4. **Data Freshness**: Ensures data is updated when changes occur
5. **Offline Resilience**: Works with cached data when offline
6. **Loading Feedback**: Users see loading states instead of empty pages
7. **Consistent Experience**: All components wait for data before showing

## Configuration

### Cache Duration

To change the cache duration, modify the `CACHE_DURATION` constant in `UserService`:

```typescript
private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
```

### Cache Key

To change the localStorage key, modify the `CACHE_KEY` constant:

```typescript
private readonly CACHE_KEY = 'customProfileCache';
```

### Loading Messages

Customize loading messages in components:

```typescript
// In component
this.loadingService.show('Custom loading message...');

// In template
<app-loading [message]="'Custom message'"></app-loading>
```

## Best Practices

1. **Always Subscribe**: Use the `profile$` observable to get real-time updates
2. **Handle Loading States**: Always check `isProfileReady` and `isLoading`
3. **Handle Errors**: Always implement error handling for API calls
4. **Cleanup**: Unsubscribe from observables in `ngOnDestroy`
5. **Force Refresh**: Use `refreshProfile()` when you need fresh data immediately
6. **Cache Validation**: Check cache status before making decisions
7. **Loading Feedback**: Show appropriate loading messages to users

## Example Implementation

```typescript
export class MyComponent implements OnInit, OnDestroy {
  private profileSubscription: Subscription | null = null;
  private loadingSubscription: Subscription | null = null;
  private readySubscription: Subscription | null = null;
  
  isProfileReady = false;
  isLoading = false;
  userProfile: any = null;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.initializeProfile();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private initializeProfile() {
    // Subscribe to all profile states
    this.readySubscription = this.userService.profileReady$.subscribe(ready => {
      this.isProfileReady = ready;
    });

    this.loadingSubscription = this.userService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });

    this.profileSubscription = this.userService.profile$.subscribe(profile => {
      if (profile) {
        this.userProfile = profile;
      }
    });

    // Fetch data if not ready
    if (!this.userService.isProfileReady()) {
      this.userService.getProfileDetails().subscribe({
        next: (profile) => {
          this.userProfile = profile;
        },
        error: (err) => {
          console.error('Failed to fetch profile:', err);
        }
      });
    }
  }

  private cleanup() {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
    if (this.readySubscription) {
      this.readySubscription.unsubscribe();
    }
  }

  refreshProfile() {
    this.userService.refreshProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
      }
    });
  }
}
```

## Troubleshooting

### Cache Not Working

1. Check if localStorage is available
2. Verify user authentication
3. Check browser console for errors
4. Ensure cache key is not conflicting

### Data Not Updating

1. Check if cache invalidation is working
2. Verify API responses
3. Check network connectivity
4. Ensure proper error handling

### Loading States Not Working

1. Check if components are subscribing to loading observables
2. Verify template conditions are correct
3. Ensure loading component is imported
4. Check for console errors

### Performance Issues

1. Reduce cache duration if needed
2. Implement proper cleanup
3. Monitor memory usage
4. Check for memory leaks

### Pages Not Loading

1. Check if profile data is being fetched
2. Verify authentication is working
3. Check network connectivity
4. Ensure error handling is implemented
