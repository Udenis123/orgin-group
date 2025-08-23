import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { ProjectService } from '../../../../services/project.services';

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
  fileReferences: { [key: string]: File | null } = {
    projectThumbnail: null
  };
  isSubmitting = false;

  constructor(private fb: FormBuilder, private projectService: ProjectService) {
    this.projectForm = this.fb.group({
      // Personal Information
      fullName: ['', [Validators.required]],
      professionalStatus: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      linkedin: [''],
      
      // Project Information
      projectName: ['', [Validators.required]],
      category: ['', [Validators.required]],
      otherCategory: [''],
      location: ['', [Validators.required]],
      description: ['', [Validators.required]],
      projectThumbnail: [null],

      // Team Requirements - Now dynamic
      requiredMembers: this.fb.array([]),

      // Confirmation
      confirmationCheckbox: [false, [Validators.requiredTrue]]
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
      // Validate current step before proceeding
      if (this.validateCurrentStep()) {
        this.currentStep++;
        this.updateFileInputs(this.currentStep);
      }
    }
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 0: // Personal Information
        const personalFields = ['fullName', 'professionalStatus', 'email', 'phone'];
        return personalFields.every(field => this.projectForm.get(field)?.valid === true);
      case 1: // Project Information
        const projectFields = ['projectName', 'category', 'location', 'description'];
        const isValid = projectFields.every(field => this.projectForm.get(field)?.valid === true);
        if (this.projectForm.get('category')?.value === 'Other') {
          return isValid && this.projectForm.get('otherCategory')?.valid === true;
        }
        return isValid;
      case 2: // Team Requirements
        return this.requiredMembers.length > 0 && this.requiredMembers.valid === true;
      case 3: // Review and Submit
        return this.projectForm.get('confirmationCheckbox')?.valid === true;
      default:
        return true;
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateFileInputs(this.currentStep);
    }
  }

  goToStep(index: number) {
    if (index >= 0 && index < this.steps.length) {
      this.currentStep = index;
      this.updateFileInputs(index);
    }
  }

  onFileChange(event: any, controlName: string) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      
      // Validate file type based on control name
      let isValid = true;
      switch (controlName) {
        case 'projectThumbnail':
          isValid = file.type.startsWith('image/');
          break;
      }

      if (!isValid) {
        alert(`Invalid file type for ${controlName}. Please upload the correct file type.`);
        event.target.value = ''; // Clear the invalid file
        return;
      }

      this.fileReferences[controlName] = file;
      this.projectForm.get(controlName)?.setValue(file);
      this.projectForm.updateValueAndValidity();
    } else {
      delete this.fileReferences[controlName];
      this.projectForm.get(controlName)?.setValue(null);
    }
  }

  onCategoryChange() {
    const category = this.projectForm.get('category')?.value;
    const otherCategoryControl = this.projectForm.get('otherCategory');
    
    if (category === 'Other') {
      otherCategoryControl?.setValidators([Validators.required]);
    } else {
      otherCategoryControl?.clearValidators();
      otherCategoryControl?.setValue('');
    }
    otherCategoryControl?.updateValueAndValidity();
  }

  async onSubmit() {
    if (this.projectForm.valid && this.requiredMembers.length > 0) {
      this.isSubmitting = true;
      try {
        // Format the data according to the API structure
        const formValue = this.projectForm.value;
        
        // Transform team requirements to match API structure
        const team = this.requiredMembers.controls.map((memberGroup: any) => ({
          title: memberGroup.value.profession,
          number: memberGroup.value.quantity
        }));

        const projectData = {
          fullName: formValue.fullName,
          profession: formValue.professionalStatus,
          email: formValue.email,
          phone: formValue.phone,
          linkedIn: formValue.linkedin || '',
          projectName: formValue.projectName,
          category: formValue.category === 'Other' ? formValue.otherCategory : formValue.category,
          location: formValue.location,
          description: formValue.description,
          team: team
        };

        // Call the service to create the community project
        await this.projectService.createCommunityProject(
          projectData,
          formValue.projectThumbnail
        );

        alert('Your community project has been submitted successfully!');
        window.location.href = this.externalServiceUrl;
      } catch (error) {
        console.error('Error submitting community project:', error);
        alert('An error occurred while submitting your project. Please try again.');
      } finally {
        this.isSubmitting = false;
      }
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
    
    // Clear file references
    this.fileReferences = {
      projectThumbnail: null
    };
    
    // Clear file inputs
    const fileInput = document.getElementById('projectThumbnail') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  markFormAsTouched() {
    // Mark all form controls as touched to trigger validation display
    Object.keys(this.projectForm.controls).forEach(key => {
      const control = this.projectForm.get(key);
      control?.markAsTouched();
    });
    
    // Mark all team requirement controls as touched
    this.requiredMembers.controls.forEach((control: any) => {
      Object.keys(control.controls).forEach(key => {
        control.get(key)?.markAsTouched();
      });
    });
  }

  updateFileInputs(step: number) {
    // For step 1 (Project Information), restore projectThumbnail if it exists
    if (step === 1 && this.fileReferences['projectThumbnail']) {
      const fileInput = document.getElementById('projectThumbnail') as HTMLInputElement;
      if (fileInput) {
        // Set the form control value
        this.projectForm.get('projectThumbnail')?.setValue(this.fileReferences['projectThumbnail']);

        // Create a new FileList using DataTransfer
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(this.fileReferences['projectThumbnail']!);
        fileInput.files = dataTransfer.files;

        // Trigger change event to update any UI bindings
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
      }
    }
  }




}
