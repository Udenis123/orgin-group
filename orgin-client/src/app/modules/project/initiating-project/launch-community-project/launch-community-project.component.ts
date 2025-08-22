import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-launch-community-project',
  standalone: true,
  templateUrl: './launch-community-project.component.html',
  styleUrls: ['./launch-community-project.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, TranslateModule]
})
export class LaunchCommunityProjectComponent {
  projectForm: FormGroup;
  projectCategories = ['Technology', 'Healthcare', 'Education', 'Finance', 'Agriculture', 'Retail', 'Other'];
  steps = ['Personal Information', 'Project Information', 'Team Requirements', 'Review and Submit'];
  currentStep = 0;
  externalServiceUrl = environment.externalServiceUrl;

  constructor(private fb: FormBuilder) {
    this.projectForm = this.fb.group({
      // Personal Information
      fullName: [''],
      professionalStatus: [''],
      email: [''],
      phone: [''],
      linkedin: [''],
      
      // Project Information
      projectName: [''],
      category: [''],
      otherCategory: [''],
      location: [''],
      description: [''],
      projectThumbnail: [null],

      // Team Requirements - Now dynamic
      requiredMembers: this.fb.array([]),

      // Confirmation
      confirmationCheckbox: [false]
    });
  }

  get requiredMembers() {
    return this.projectForm.get('requiredMembers') as FormArray;
  }

  // Add a new team requirement
  addTeamRequirement() {
    const teamRequirement = this.fb.group({
      profession: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.requiredMembers.push(teamRequirement);
  }

  // Remove a team requirement
  removeTeamRequirement(index: number) {
    this.requiredMembers.removeAt(index);
  }

  // Get form controls for a specific team requirement
  getTeamRequirementControls(index: number) {
    return this.requiredMembers.at(index) as FormGroup;
  }

  // Get profession control for a specific team requirement
  getProfessionControl(index: number): FormControl {
    return (this.requiredMembers.at(index) as FormGroup).get('profession') as FormControl;
  }

  // Get quantity control for a specific team requirement
  getQuantityControl(index: number): FormControl {
    return (this.requiredMembers.at(index) as FormGroup).get('quantity') as FormControl;
  }

  // ... existing navigation methods from project-launch component ...
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

  onFileChange(event: any, controlName: string) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.projectForm.get(controlName)?.setValue(file);
    }
  }

  onSubmit() {
    if (this.projectForm.valid && this.requiredMembers.length > 0) {
      console.log(this.projectForm.value);
      alert('Your community project has been submitted successfully!');
      window.location.href = this.externalServiceUrl;
    } else if (this.requiredMembers.length === 0) {
      alert('Please add at least one team requirement before submitting.');
    } else {
      alert('Please fill in all required fields correctly.');
    }
  }

  onClear() {
    this.projectForm.reset();
    this.currentStep = 0;
    // Clear the form array
    while (this.requiredMembers.length !== 0) {
      this.requiredMembers.removeAt(0);
    }
  }
}
