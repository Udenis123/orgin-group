import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { ProfileCacheService, ProfileData } from '../../../shared/services/profile-cache.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
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

  constructor(
    private userService: UserService,
    private cookieService: CookieService,
    private profileCacheService: ProfileCacheService
  ) {}

  ngOnInit() {
    this.loadProfileData();
  }

  loadProfileData() {
    // Try to get cached data immediately for instant loading
    const cachedProfile = this.profileCacheService.getCachedDataImmediately();
    if (cachedProfile) {
      this.updateUserDataFromProfile(cachedProfile);
    }

    // Use cached profile data for faster loading
    this.profileCacheService.getProfile().subscribe({
      next: (profile: ProfileData | null) => {
        if (!profile) return;
        this.updateUserDataFromProfile(profile);
      },
      error: (err) => {
        console.error('Failed to load profile data:', err);
      }
    });
  }

  private updateUserDataFromProfile(profile: ProfileData): void {
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
        : 'assets/images/default-profile.png'
    };
  }
}