import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from './cookie.service';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userData: any;

  constructor(
    private http: HttpClient, 
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadUserData();
  }

  getProfileDetails() {
    const token = this.cookieService.getCookie('adminToken');
    const userId = this.cookieService.getCookie('adminId');

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
    });
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
    });
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
    });
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
    return this.http.put('/api/update-user', userData);
  }
}
