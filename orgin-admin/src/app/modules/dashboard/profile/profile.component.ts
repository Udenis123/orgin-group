import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Fetch fresh data from API
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