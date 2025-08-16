import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

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
  requiredProfessions = ['Developer', 'Designer', 'Marketer', 'BusinessAnalyst', 'ProjectManager', 'Other'];
  steps = ['Personal Information', 'Project Information', 'Team Requirements', 'Review and Submit'];
  currentStep = 0;

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

      // Team Requirements
      requiredMembers: this.fb.array(
        this.requiredProfessions.map(profession => 
          this.fb.group({
            profession: [profession],
            quantity: [0]
          })
        )
      ),

      // Confirmation
      confirmationCheckbox: [false]
    });
  }

  get requiredMembers() {
    return this.projectForm.get('requiredMembers') as FormArray;
  }

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
    if (this.projectForm.valid) {
      console.log(this.projectForm.value);
      alert('Your community project has been submitted successfully!');
      window.location.href = 'http://localhost:4202';
    }
  }

  onClear() {
    this.projectForm.reset();
    this.currentStep = 0;
  }
}
