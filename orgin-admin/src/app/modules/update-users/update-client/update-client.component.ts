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
      nationalId: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
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
    this.clientService.getAllClients()
      .pipe(
        catchError(error => {
          console.error('Error loading clients:', error);
          this.snackBar.open('Failed to load clients. Please try again.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(clients => {
        // Find the specific client by ID
        const client = clients.find(c => c.id === this.clientId);
        if (client) {
          this.client = client;
          this.populateForm(client);
          console.log('Found client:', client.name, 'National ID:', client.nationalId);
        } else {
          this.snackBar.open('Client not found', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          this.router.navigate(['dashboard/users/clients']);
        }
      });
  }

  populateForm(client: Client) {
    this.firstFormGroup.patchValue({
      nationalId: client.nationalId || ''
    });
  }

  getFormData(): { label: string, value: any }[] {
    return [
      { label: 'National ID', value: this.firstFormGroup.get('nationalId')?.value }
    ];
  }

    async submitForm(): Promise<void> {
    if (this.firstFormGroup.invalid || this.isSubmitting || !this.clientId) return;

    this.isSubmitting = true;
    
    // Get the current national ID from the form
    const newNationalId = this.firstFormGroup.get('nationalId')?.value;
    
    // Update the national ID using the specific endpoint
    this.clientService.updateClientNationalId(this.clientId!, newNationalId)
      .pipe(
        catchError(error => {
          console.error('Error updating client national ID:', error);
          this.snackBar.open('Failed to update client national ID. Please try again.', 'Close', {
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
      .subscribe(response => {
        if (response !== null) {
          this.snackBar.open('Client national ID updated successfully', 'Close', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          this.router.navigate(['dashboard/users/clients']);
        }
      });
  }



  goBack(): void {
    this.router.navigate(['dashboard/users/clients']);
  }
}
