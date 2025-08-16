import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CustomButtonComponent } from '../../../shared/components/custom-button/custom-button.component';

@Component({
  selector: 'app-update-client',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    CustomButtonComponent
  ],
  templateUrl: './update-client.component.html',
  styleUrl: './update-client.component.scss'
})
export class UpdateClientComponent implements OnInit {
  isLinear = false;
  steps = ['Client Information'];
  currentStep = 0;
  isSubmitting = false;
  clientId: string | null = null;
  
  firstFormGroup: FormGroup;

  constructor(private route: ActivatedRoute, private _formBuilder: FormBuilder) {
    this.firstFormGroup = this._formBuilder.group({
      nationalId: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
    });
  }

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('id');
    
    // Dummy data for testing
    const dummyData = [
      {
        id: '1',
        nationalId: '123456789',
        status: 'Active'
      },
      {
        id: '2',
        nationalId: '987654321',
        status: 'Disabled'
      }
    ];

    // Find the dummy data matching the clientId
    const selectedData = dummyData.find(data => data.id === this.clientId);

    if (selectedData) {
      // Populate the form with the selected dummy data
      this.firstFormGroup.patchValue({
        nationalId: selectedData.nationalId
      });
    } else {
      console.warn('No dummy data found for clientId:', this.clientId);
    }
  }

  getFormData(): { label: string, value: any }[] {
    return [
      { label: 'National ID', value: this.firstFormGroup.get('nationalId')?.value }
    ];
  }

  async submitForm(): Promise<void> {
    if ((this.firstFormGroup.invalid || this.isSubmitting)) return;

    this.isSubmitting = true;
    try {
      const formData = {
        ...this.firstFormGroup.value,
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

  async resetPassword(): Promise<void> {
    this.isSubmitting = true;
    try {
      console.log('Resetting password...');
      // Add your password reset logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Password reset failed:', error);
    } finally {
      this.isSubmitting = false;
    }
  }
}
