import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import i18nCountries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { getCountryCallingCode } from 'libphonenumber-js';
import { CustomButtonComponent } from '../../../shared/components/custom-button/custom-button.component';
import { AnalyzerService } from '../../../services/analyzer.service';
import { CookieService } from '../../../services/cookie.service';
import { Router } from '@angular/router';

interface Country {
  name: string;
  code: string;
  phone: string;
}

@Component({
  selector: 'app-new-analyzer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    CustomButtonComponent,
    TranslateModule
  ],
  templateUrl: './new-analyzer.component.html',
  styleUrls: ['./new-analyzer.component.scss']
})
export class NewAnalyzerComponent {
  isLinear = true;
  steps = [
    'new_analyzer.steps.personal_info',
    'new_analyzer.steps.account_details',
    'new_analyzer.steps.review'
  ];
  currentStep = 0;
  isSubmitting = false;
  errorMessage: string = '';
  showSuccessMessage = false;
  successMessage = '';
  
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  countries: Country[] = [];
  loadingCountries = true;

  genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' }
  ];

  constructor(
    private _formBuilder: FormBuilder,
    private analyzerService: AnalyzerService,
    private cookieService: CookieService,
    private router: Router
  ) {
    this.firstFormGroup = this._formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      nationalId: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      nationality: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      expertise: ['', Validators.required],
      gender: ['', Validators.required]
    });

    this.secondFormGroup = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{9,15}$/)]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,20}$/)
      ]],
      confirmPassword: ['', Validators.required]
    });

    i18nCountries.registerLocale(en);
    this.loadCountries();
  }

  loadCountries(): void {
    const countryData = i18nCountries.getNames('en');
    this.countries = Object.entries(countryData)
      .map(([code, name]) => {
        try {
          const phone = getCountryCallingCode(code as any);
          return {
            name,
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

  onCountryChange(event: any): void {
    const selectedCountry = event.target.value;
    try {
      const phoneCode = getCountryCallingCode(selectedCountry as any);
      this.secondFormGroup.get('countryCode')?.setValue(phoneCode);
    } catch (error) {
      this.secondFormGroup.get('countryCode')?.setValue('');
    }
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  goToStep(index: number) {
    if (index >= 0 && index < this.steps.length) {
      this.currentStep = index;
    }
  }

  async submitForm(): Promise<void> {
    if (this.firstFormGroup.invalid || this.secondFormGroup.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formData = {
      ...this.firstFormGroup.value,
      ...this.secondFormGroup.value,
      phoneNumber: this.getCountryCode(this.secondFormGroup.get('countryCode')?.value) + this.secondFormGroup.get('phoneNumber')?.value
    };

    try {
      const response = await this.analyzerService.registerAnalyzer(formData).toPromise();
      this.showSuccessMessage = true;
      this.successMessage = 'new_analyzer.messages.success';
      
      // Reset form
      this.firstFormGroup.reset();
      this.secondFormGroup.reset();
      this.currentStep = 0;

      // Redirect after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);
    } catch (error: any) {
      this.errorMessage = error.error?.message || 'new_analyzer.messages.error';
    } finally {
      this.isSubmitting = false;
    }
  }

  getFormData(): { label: string, value: any }[] {
    const genderLabel = this.genderOptions.find(opt => opt.value === this.firstFormGroup.get('gender')?.value)?.label;
    const countryCode = this.getCountryCode(this.secondFormGroup.get('countryCode')?.value).replace('+', '');
    const phoneNumber = this.secondFormGroup.get('phoneNumber')?.value;
    
    return [
      { label: 'new_analyzer.form.name', value: this.firstFormGroup.get('name')?.value },
      { label: 'new_analyzer.form.national_id', value: this.firstFormGroup.get('nationalId')?.value },
      { label: 'new_analyzer.form.nationality', value: this.firstFormGroup.get('nationality')?.value },
      { label: 'new_analyzer.form.expertise', value: this.firstFormGroup.get('expertise')?.value },
      { label: 'new_analyzer.form.gender', value: genderLabel },
      { label: 'new_analyzer.form.email', value: this.secondFormGroup.get('email')?.value },
      { label: 'new_analyzer.form.phone', value: `${countryCode}${phoneNumber}` },
      { label: 'new_analyzer.form.password', value: '********' } // Masked for security
    ];
  }
}
