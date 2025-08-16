import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  email: string;
  resetOtp: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cookieService: CookieService
  ) {
    this.email = this.cookieService.get('forgotEmail');
    this.resetOtp = this.cookieService.get('resetOtp');

    this.resetForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordComplexityValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  passwordComplexityValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    return hasUpperCase && hasDigit && hasSpecialChar ? null : { complexity: true };
  }

  onSubmit() {
    if (this.resetForm.valid) {
      const newPassword = this.resetForm.get('password')?.value;
      const resetData = {
        email: this.email,
        code: this.resetOtp,
        newPassword: newPassword
      };

      this.authService.resetPassword(resetData).subscribe({
        next: (response) => {
          this.cookieService.delete('forgotEmail');
          this.cookieService.delete('resetOtp');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Password reset failed:', err);
          alert('Password reset failed. Please try again.');
        }
      });
    }
  }
}
