import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { CustomButtonComponent } from '../../../shared/components/custom-button/custom-button.component';
import { ClientService, Client, UpdateClientRequest } from '../../../services/client.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

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
  isLoading = false;
  clientId: string | null = null;
  client: Client | null = null;
  
  firstFormGroup: FormGroup;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private _formBuilder: FormBuilder,
    private clientService: ClientService,
    private snackBar: MatSnackBar
  ) {
    this.firstFormGroup = this._formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      nationalId: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      gender: ['', Validators.required],
      nationality: ['', Validators.required],
      professional: ['', Validators.required],
      profession: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('id');
    
    if (this.clientId) {
      this.loadClientDetails();
    } else {
      this.snackBar.open('Client ID not found', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      this.router.navigate(['dashboard/users/clients']);
    }
  }

  loadClientDetails() {
    if (!this.clientId) return;

    this.isLoading = true;
    this.clientService.getClientDetails(this.clientId)
      .pipe(
        catchError(error => {
          console.error('Error loading client details:', error);
          this.snackBar.open('Failed to load client details. Please try again.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(client => {
        if (client) {
          this.client = client;
          this.populateForm(client);
        }
      });
  }

  populateForm(client: Client) {
    this.firstFormGroup.patchValue({
      name: client.name || '',
      nationalId: client.nationalId || '',
      phone: client.phone || '',
      phoneNumber: client.phone || '', // Using phone as phoneNumber
      gender: client.gender || '',
      nationality: client.nationality || '',
      professional: client.professional || '',
      profession: client.professional || '' // Using professional as profession
    });
  }

  getFormData(): { label: string, value: any }[] {
    return [
      { label: 'Name', value: this.firstFormGroup.get('name')?.value },
      { label: 'National ID', value: this.firstFormGroup.get('nationalId')?.value },
      { label: 'Phone', value: this.firstFormGroup.get('phone')?.value },
      { label: 'Gender', value: this.firstFormGroup.get('gender')?.value },
      { label: 'Nationality', value: this.firstFormGroup.get('nationality')?.value },
      { label: 'Professional', value: this.firstFormGroup.get('professional')?.value }
    ];
  }

  async submitForm(): Promise<void> {
    if (this.firstFormGroup.invalid || this.isSubmitting || !this.clientId) return;

    this.isSubmitting = true;
    
    const formData: UpdateClientRequest = {
      id: this.clientId,
      name: this.firstFormGroup.get('name')?.value,
      nationalId: this.firstFormGroup.get('nationalId')?.value,
      phone: this.firstFormGroup.get('phone')?.value,
      phoneNumber: this.firstFormGroup.get('phoneNumber')?.value,
      gender: this.firstFormGroup.get('gender')?.value,
      nationality: this.firstFormGroup.get('nationality')?.value,
      professional: this.firstFormGroup.get('professional')?.value,
      profession: this.firstFormGroup.get('profession')?.value
    };

    this.clientService.updateClient(formData)
      .pipe(
        catchError(error => {
          console.error('Error updating client:', error);
          this.snackBar.open('Failed to update client. Please try again.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          return of(null);
        }),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe(() => {
        this.snackBar.open('Client updated successfully', 'Close', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        this.router.navigate(['dashboard/users/clients']);
      });
  }

  async resetPassword(): Promise<void> {
    this.isSubmitting = true;
    try {
      console.log('Resetting password...');
      // Add your password reset logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.snackBar.open('Password reset functionality not implemented yet', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    } catch (error) {
      console.error('Password reset failed:', error);
      this.snackBar.open('Password reset failed', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  goBack(): void {
    this.router.navigate(['dashboard/users/clients']);
  }
}
