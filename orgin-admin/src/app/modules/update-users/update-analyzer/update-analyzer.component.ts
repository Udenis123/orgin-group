import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import i18nCountries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { getCountryCallingCode } from 'libphonenumber-js';
import { CustomButtonComponent } from '../../../shared/components/custom-button/custom-button.component';

interface Country {
  name: string;
  code: string;
  phone: string;
}

@Component({
  selector: 'app-update-analyzer',
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
  templateUrl: './update-analyzer.component.html',
  styleUrl: './update-analyzer.component.scss'
})
export class UpdateAnalyzerComponent implements OnInit {
  isLinear = true;
  steps = [
    'update_analyzer.steps.personal_info',
    'update_analyzer.steps.account_details',
    'update_analyzer.steps.review'
  ];
  currentStep = 0;
  isSubmitting = false;
  
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  countries: Country[] = [];
  loadingCountries = true;
  analyzerId: string | null = null;

  constructor(
    private route: ActivatedRoute, 
    private _formBuilder: FormBuilder,
    private translate: TranslateService
  ) {
    this.firstFormGroup = this._formBuilder.group({
      fullName: ['', Validators.required],
      nationalId: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      nationality: ['', Validators.required],
      expertise: ['', Validators.required]
    });

    this.secondFormGroup = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      country: ['', Validators.required],
      phoneNumber: ['', Validators.required]
    });

    i18nCountries.registerLocale(en);
    this.loadCountries();
  }

  ngOnInit(): void {
    this.analyzerId = this.route.snapshot.paramMap.get('id');
    
    // Multiple dummy data entries for testing
    const dummyData = [
      {
        id: '1',
        fullName: 'John Doe',
        nationalId: '123456789',
        nationality: 'Kenyan',
        email: 'john.doe@example.com',
        country: 'KE',
        phoneNumber: '712345678',
        expertise: 'Soil Analysis'
      },
      {
        id: '2',
        fullName: 'Jane Smith',
        nationalId: '987654321',
        nationality: 'Ugandan',
        email: 'jane.smith@example.com',
        country: 'UG',
        phoneNumber: '712345679',
        expertise: 'Water Quality'
      },
      {
        id: '3',
        fullName: 'Alice Johnson',
        nationalId: '456789123',
        nationality: 'Tanzanian',
        email: 'alice.johnson@example.com',
        country: 'TZ',
        phoneNumber: '712345680',
        expertise: 'Crop Health'
      }
    ];

    const selectedData = dummyData.find(data => data.id === this.analyzerId);

    if (selectedData) {
      this.firstFormGroup.patchValue({
        fullName: selectedData.fullName,
        nationalId: selectedData.nationalId,
        nationality: selectedData.nationality,
        expertise: selectedData.expertise || ''
      });

      this.secondFormGroup.patchValue({
        email: selectedData.email,
        country: selectedData.country,
        phoneNumber: selectedData.phoneNumber
      });
    } else {
      console.warn('No dummy data found for analyzerId:', this.analyzerId);
    }
  }

  loadCountries(): void {
    const countryData = i18nCountries.getNames(this.translate.currentLang || 'en');
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

  getFormData(): { label: string, value: any }[] {
    return [
      { label: 'update_analyzer.form.full_name', value: this.firstFormGroup.get('fullName')?.value },
      { label: 'update_analyzer.form.national_id', value: this.firstFormGroup.get('nationalId')?.value },
      { label: 'update_analyzer.form.nationality', value: this.firstFormGroup.get('nationality')?.value },
      { label: 'update_analyzer.form.email', value: this.secondFormGroup.get('email')?.value },
      { label: 'update_analyzer.form.country', value: this.countries.find(c => c.code === this.secondFormGroup.get('country')?.value)?.name },
      { label: 'update_analyzer.form.phone_number', value: `${this.getCountryCode(this.secondFormGroup.get('country')?.value)} ${this.secondFormGroup.get('phoneNumber')?.value}` },
      { label: 'update_analyzer.form.expertise', value: this.firstFormGroup.get('expertise')?.value }
    ];
  }

  goToStep(index: number) {
    if (index >= 0 && index < this.steps.length) {
      this.currentStep = index;
    }
  }

  async submitForm(): Promise<void> {
    if ((this.firstFormGroup.invalid || this.secondFormGroup.invalid) || this.isSubmitting) return;

    this.isSubmitting = true;
    try {
      const formData = {
        ...this.firstFormGroup.value,
        ...this.secondFormGroup.value
      };
      
      console.log('Form Data:', formData);
      // Add your form submission logic here
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      this.isSubmitting = false;
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

  getCountryCode(countryCode: string): string {
    try {
      const phone = getCountryCallingCode(countryCode as any);
      return `+${phone}`;
    } catch (error) {
      return '';
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }
}
