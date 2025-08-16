import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationExtras } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { countries } from 'countries-list';
import { getCountryCallingCode } from 'libphonenumber-js';
import { AuthService } from '../../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';

interface Country {
  name: string;
  code: string;
  phone: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule]
})
export class SignupComponent {
  signupForm: FormGroup;
  currentStep = 1;
  countries: Country[] = [];
  loadingCountries = true;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private http: HttpClient,
    private authService: AuthService,
    private cookieService: CookieService
  ) {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(10)]],
      idNumber: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]],
      gender: ['', [Validators.required]],
      nationality: ['', [Validators.required]],
      profession: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      country: ['', [Validators.required]],
      phoneCode: [''],
      phoneNumber: ['', [
        Validators.required, 
        Validators.pattern(/^[0-9]{9,15}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/)
      ]],
      confirmPassword: ['', [Validators.required]],
    }, { validator: this.passwordMatchValidator });
    this.loadCountries();
  }

  loadCountries(): void {
    this.countries = Object.entries(countries)
      .map(([code, countryData]) => {
        try {
          const phone = getCountryCallingCode(code as any);
          return {
            name: countryData.name,
            code,
            phone: phone || '0'
          };
        } catch (error) {
          return null;
        }
      })
      .filter(country => country !== null)
      .sort((a, b) => a!.name.localeCompare(b!.name));
  }

  getCountryCode(countryCode: string): string {
    try {
      const phone = getCountryCallingCode(countryCode as any);
      return `+${phone}`;
    } catch (error) {
      return '';
    }
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword ? { 'mismatch': true } : null;
  }

  onCountryChange(event: any): void {
    const selectedCountry = event.target.value;
    const idNumberControl = this.signupForm.get('idNumber');
    
    try {
      const phoneCode = getCountryCallingCode(selectedCountry as any);
      this.signupForm.get('phoneCode')?.setValue(phoneCode);
    } catch (error) {
      this.signupForm.get('phoneCode')?.setValue('');
    }

    if (selectedCountry === 'RW') {
      idNumberControl?.setValidators([Validators.required, Validators.maxLength(16)]);
    } else {
      idNumberControl?.setValidators([Validators.required]);
    }
    idNumberControl?.updateValueAndValidity();
  }

  nextStep(): void {
    if (this.isStepValid(this.currentStep)) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    this.currentStep--;
  }

  isStepValid(stepNumber: number): boolean {
    switch(stepNumber) {
      case 1:
        return ['fullName', 'idNumber', 'gender', 'nationality']
          .every(ctrl => this.signupForm.get(ctrl)?.valid);
      case 2:
        return ['profession', 'email', 'country', 'phoneNumber']
          .every(ctrl => this.signupForm.get(ctrl)?.valid);
      case 3:
        return this.signupForm.valid;
      default:
        return false;
    }
  }

  getEncouragementMessage(): string {
    switch(this.currentStep) {
      case 1:
        return "Let's start with your basic information – we'll keep it safe!";
      case 2:
        return "Almost there! We just need a few more details to connect with you.";
      case 3:
        return "Final step! Set up your account security – safety first!";
      default:
        return "You're doing great! Keep going!";
    }
  }

  phoneNumberValidator() {
    return (control: any) => {
      if (!control.value) {
        return null;
      }
      
      const cleanNumber = control.value.replace(/\D/g, '');
      
      if (!/^\d+$/.test(cleanNumber)) {
        return { 'invalidDigits': true };
      }
      
      if (cleanNumber.length < 9 || cleanNumber.length > 15) {
        return { 'invalidLength': true };
      }
      
      return null;
    };
  }

  async onSubmit(): Promise<void> {
    if (this.signupForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      const formData = this.signupForm.value;
      
      // Clean the phone number to include only digits
      const phoneNumber = formData.phoneNumber.replace(/\D/g, '');
      
      // Use the selected country code
      const phoneCode = formData.phoneCode || '250'; // Default to Rwanda if not set
      const fullPhoneNumber = `${phoneCode}${phoneNumber}`;
      
      // Create the payload exactly matching the format that worked in Postman
      const signupData = {
        "name": formData.fullName,
        "nationalId": formData.idNumber,
        "gender": formData.gender,
        "nationality": formData.nationality,
        "professional": formData.profession,
        "email": formData.email.trim().toLowerCase(),
        "phone": fullPhoneNumber, // Make sure phone has country code
        "password": formData.password
      };
      
      console.log('Sending to backend:', JSON.stringify(signupData));
      
      this.authService.signup(signupData).subscribe({
        next: (response) => {
          console.log('Signup successful:', response);
          // Store email in cookies instead of localStorage
          this.cookieService.set('otpEmail', formData.email);
          
          const navigationExtras: NavigationExtras = {
            state: { fromSignup: true }
          };
          
          this.router.navigate(
            ['auth','0','1','0','a','e','now','verify-email'], 
            navigationExtras
          );
        },
        error: (error) => {
          console.error('Signup failed - full error:', error);
          this.isSubmitting = false;
          
          // Log more detailed error information
          console.log('Error status:', error.status);
          console.log('Error message:', error.message);
          console.log('Error name:', error.name);
          
          if (error.error) {
            console.log('Error body:', JSON.stringify(error.error, null, 2));
          }
          
          // Handle different types of errors
          if (error.status === 0) {
            this.errorMessage = 'Cannot connect to the server. Please check your internet connection.';
          } else if (error.status === 400) {
            if (error.error && error.error.validationErrors) {
              const errors = error.error.validationErrors;
              this.errorMessage = Object.values(errors).join(', ');
            } else {
              this.errorMessage = 'Invalid data provided. Please check your information.';
            }
          } else if (error.status === 409) {
            this.errorMessage = 'This email or ID is already registered.';
          } else if (error.status === 500) {
            this.errorMessage = 'Server error. Please try again later.';
          } else {
            this.errorMessage = 'Registration failed. Please try again.';
          }
        },
        complete: () => {
          console.log('Signup request completed');
        }
      });
    } else {
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
      console.log('Form is invalid');
    }
  }

  getPasswordErrors(): string {
    const passwordControl = this.signupForm.get('password');
    const confirmPasswordControl = this.signupForm.get('confirmPassword');
    
    if (this.signupForm.errors?.['mismatch'] && confirmPasswordControl?.touched) {
      return 'Passwords do not match';
    }

    if (!passwordControl?.errors) return '';

    if (passwordControl.errors['required']) {
      return 'Password is required';
    }
    if (passwordControl.errors['minlength']) {
      return 'Password must be at least 8 characters';
    }
    if (passwordControl.errors['maxlength']) {
      return 'Password cannot exceed 20 characters';
    }
    if (passwordControl.errors['pattern']) {
      return 'Password must contain at least one uppercase letter, one number, and one special character (@$!%*?&)';
    }
    return '';
  }

  getPhoneNumberErrors(): string {
    const phoneNumberControl = this.signupForm.get('phoneNumber');
    
    if (!phoneNumberControl?.errors) return '';
    
    if (phoneNumberControl.errors['required']) {
      return 'Phone number is required';
    }
    if (phoneNumberControl.errors['pattern']) {
      return 'Phone number must contain only digits and be between 9-15 digits';
    }
    
    return '';
  }
}