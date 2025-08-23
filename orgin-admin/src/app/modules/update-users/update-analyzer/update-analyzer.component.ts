import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CustomButtonComponent } from '../../../shared/components/custom-button/custom-button.component';
import { AnalyzerService, AnalyzerDetails } from '../../../services/analyzer.service';



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
    MatSnackBarModule,
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
  analyzerId: string | null = null;
  analyzerDetails: AnalyzerDetails | null = null;
  isLoading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _formBuilder: FormBuilder,
    private translate: TranslateService,
    private analyzerService: AnalyzerService,
    private snackBar: MatSnackBar
  ) {
    this.firstFormGroup = this._formBuilder.group({
      fullName: ['', Validators.required],
      nationalId: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      nationality: ['', Validators.required],
      expertise: ['', Validators.required],
      gender: ['', Validators.required]
    });

    this.secondFormGroup = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required]
    });


  }

  ngOnInit(): void {
    this.analyzerId = this.route.snapshot.paramMap.get('id');
    
    if (this.analyzerId) {
      this.loadAnalyzerDetails();
    } else {
      this.error = true;
      this.isLoading = false;
      this.showNotification('Error: Analyzer ID not found', 'error');
    }
  }

  loadAnalyzerDetails(): void {
    this.isLoading = true;
    this.error = false;

    this.analyzerService.getAnalyzerDetails(this.analyzerId!).subscribe({
      next: (details) => {
        this.analyzerDetails = details;
        this.populateFormWithAnalyzerData(details);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading analyzer details:', error);
        this.error = true;
        this.isLoading = false;
        this.showNotification('Error loading analyzer details', 'error');
      }
    });
  }

  populateFormWithAnalyzerData(analyzer: AnalyzerDetails): void {
    this.firstFormGroup.patchValue({
      fullName: analyzer.name || '',
      nationalId: analyzer.nationalId || '',
      nationality: analyzer.nationality || '',
      expertise: analyzer.expertise || '',
      gender: analyzer.gender || ''
    });

    this.secondFormGroup.patchValue({
      email: analyzer.email || '',
      phoneNumber: analyzer.phone || ''
    });
  }



  getFormData(): { label: string, value: any }[] {
    return [
      { label: 'update_analyzer.form.full_name', value: this.firstFormGroup.get('fullName')?.value },
      { label: 'update_analyzer.form.national_id', value: this.firstFormGroup.get('nationalId')?.value },
      { label: 'update_analyzer.form.nationality', value: this.firstFormGroup.get('nationality')?.value },
      { label: 'update_analyzer.form.gender', value: this.firstFormGroup.get('gender')?.value },
      { label: 'update_analyzer.form.email', value: this.secondFormGroup.get('email')?.value },
      { label: 'update_analyzer.form.phone_number', value: this.secondFormGroup.get('phoneNumber')?.value },
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
        name: this.firstFormGroup.get('fullName')?.value,
        email: this.secondFormGroup.get('email')?.value,
        phone: this.getFullPhoneNumber(),
        expertise: this.firstFormGroup.get('expertise')?.value,
        nationality: this.firstFormGroup.get('nationality')?.value,
        nationalId: this.firstFormGroup.get('nationalId')?.value,
        gender: this.firstFormGroup.get('gender')?.value
      };
      
      console.log('Form Data:', formData);
      
      this.analyzerService.updateAnalyzer(this.analyzerId!, formData).subscribe({
        next: (response) => {
          console.log('Analyzer updated successfully:', response);
          this.showNotification(response || 'Analyzer updated successfully', 'success');
          this.router.navigate(['/dashboard/users/analyzer']);
        },
        error: (error) => {
          console.error('Error updating analyzer:', error);
          // Check if it's actually a success with status 200
          if (error.status === 200 && error.error) {
            this.showNotification(error.error, 'success');
            this.router.navigate(['/dashboard/users/analyzer']);
          } else {
            this.showNotification('Error updating analyzer. Please try again.', 'error');
          }
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } catch (error) {
      console.error('Submission failed:', error);
      this.showNotification('Error updating analyzer. Please try again.', 'error');
      this.isSubmitting = false;
    }
  }

  getFullPhoneNumber(): string {
    return this.secondFormGroup.get('phoneNumber')?.value || '';
  }

  showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
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
