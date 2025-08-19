import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
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

  private profileSubscription: Subscription | null = null;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  ngOnDestroy() {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  loadUserProfile() {
    // Use preload method for faster loading
    this.userService.preloadProfile().subscribe({
      next: (response) => {
        this.setUserData(response);
      },
      error: (err) => {
        console.error('Failed to load profile data:', err);
      }
    });

    // Subscribe to profile updates
    this.profileSubscription = this.userService.getProfileObservable().subscribe({
      next: (profile) => {
        if (profile) {
          this.setUserData(profile);
        }
      },
      error: (err) => {
        console.error('Failed to load profile data:', err);
      }
    });
  }

  private setUserData(response: any) {
    this.userData = {
      fullName: response.fullName,
      email: response.email,
      phoneNumber: response.phone,
      idNumber: response.idNumber,
      gender: response.gender,
      nationality: response.nationality,
      profession: response.profession,
      profilePicture: response.profilePicture && response.profilePicture.trim() !== ''
        ? response.profilePicture
        : 'assets/images/logo.png'
    };
  }
}