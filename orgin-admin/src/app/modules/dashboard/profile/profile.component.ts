import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LoadingComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  userData: any = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+250 788 123 456',
    idNumber: '1234567890123',
    gender: 'Male',
    nationality: 'Rwandan',
    profession: 'Software Engineer',
    country: 'Rwanda',
    profilePicture: 'assets/images/logo.png'
  };

  isProfileReady = false;
  isLoading = false;
  private profileSubscription: Subscription | null = null;
  private loadingSubscription: Subscription | null = null;
  private readySubscription: Subscription | null = null;

  constructor(
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.initializeProfile();
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

  private initializeProfile() {
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
        this.userData = {
          fullName: profile.fullName,
          email: profile.email,
          phoneNumber: profile.phone,
          idNumber: profile.idNumber,
          gender: profile.gender,
          nationality: profile.nationality,
          profession: profile.profession,
          profilePicture: profile.profilePicture
            ? `${profile.profilePicture}`
            : 'assets/images/logo.png'
        };
      }
    });

    // Fetch profile data if not already ready
    if (!this.userService.isProfileReady()) {
      this.userService.getProfileDetails().subscribe({
        next: (response) => {
          this.userData = {
            fullName: response.fullName,
            email: response.email,
            phoneNumber: response.phone,
            idNumber: response.idNumber,
            gender: response.gender,
            nationality: response.nationality,
            profession: response.profession,
            profilePicture: response.profilePicture
              ? `${response.profilePicture}`
              : 'assets/images/logo.png'
          };
        },
        error: (err) => {
          console.error('Failed to load profile data:', err);
          // Fallback to localStorage if API fails
          if (isPlatformBrowser(this.platformId)) {
            const storedProfile = localStorage.getItem('userProfile');
            if (storedProfile) {
              const profileData = JSON.parse(storedProfile);
              this.userData = {
                fullName: profileData.fullname,
                email: profileData.email,
                phoneNumber: profileData.phoneNumber,
                idNumber: profileData.idNumber,
                gender: profileData.gender,
                nationality: profileData.nationality,
                profession: profileData.profession,
                country: profileData.country,
                profilePicture: profileData.profilePicture
              };
            }
          }
        }
      });
    }
  }
}