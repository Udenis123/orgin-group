import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private cookieService: CookieService) {

  }

  sendVerificationEmail(email: string) {
    const token = this.cookieService.get('token');
    const userId = this.cookieService.get('userId');

    if (!token || !userId) {
      throw new Error('Authentication data not found');
    }

    return this.http.post(`${environment.apiUrl}/client/setting/update/email`, null, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        userId: userId,
        newEmail: email
      }
    });
  }

  verifyEmail(code: string) {
    const token = this.cookieService.get('token');
    const userId = this.cookieService.get('userId');

    if (!token || !userId) {
      throw new Error('Authentication data not found');
    }

    return this.http.post(`${environment.apiUrl}/client/setting/verify/${code}`, null, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        userId: userId
      }
    });
  }

  updateUserData(userData: any) {
    // Replace with your actual API endpoint
    return this.http.put('/api/update-user', userData);
  }

  uploadProfileImage(file: File, userId: string) {
    const token = this.cookieService.get('token');
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

  getProfileDetails() {
    const token = this.cookieService.get('token');
    const userId = this.cookieService.get('userId');

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

  updatePassword(oldPassword: string, newPassword: string) {
    const token = this.cookieService.get('token');
    const userId = this.cookieService.get('userId');

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

  updateProfile(profileData: any) {
    const token = this.cookieService.get('token');
    const userId = this.cookieService.get('userId');

    if (!token || !userId) {
      throw new Error('Authentication data not found');
    }

    const profileUpdateDto = {
      id: userId,
      professional: profileData.profession,
      phone: profileData.phoneNumber,
      name: profileData.fullName
    };

    return this.http.put(`${environment.apiUrl}/client/setting/profile/update`, profileUpdateDto, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}
