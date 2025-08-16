import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { TranslateModule } from '@ngx-translate/core';

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

  constructor(private userService: UserService) {}

  ngOnInit() {
    // Load user data from localStorage
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
            : 'assets/images/default-profile.png'
        };
        
        // Remove cookie storage for userProfile
      },
      error: (err) => {
        console.error('Failed to load profile data:', err);
      }
    });
  }
}