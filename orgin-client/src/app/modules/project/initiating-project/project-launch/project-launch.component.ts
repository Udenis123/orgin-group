import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectService } from '../../../../services/project.services';
import { Router } from '@angular/router';
import { FeedbackService } from '../../../../shared/services/feedback.service';

@Component({
  selector: 'app-project-launch',
  standalone: true,
  templateUrl: './project-launch.component.html',
  styleUrls: ['./project-launch.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
})
export class ProjectLaunchComponent {
  projectForm: FormGroup;
  projectCategories = [
    'Technology',
    'Healthcare',
    'Education',
    'Finance',
    'Agriculture',
    'Retail',
    'Other',
  ];
  projectStatuses = ['Idea', 'Prototype', 'Operating'];
  sponsorshipOptions = ['Yes', 'No'];
  ipOptions = ['Yes', 'No'];
  projectPurposes = ['Invest', 'Buy with ownership', 'Buy without ownership'];
  steps = [
    'Personal Information',
    'Project Information',
    'Sponsorship',
    'Intellectual Property',
    'Review and Submit',
  ];
  currentStep = 0;
  fileReferences: { [key: string]: File | null } = {
    projectThumbnail: null,
    incomeStatement: null,
    cashFlowStatement: null,
    balanceSheet: null,
    pitchingVideo: null,
    businessPlan: null,
    businessIdeaDocument: null,
  };
  isSubmitting: boolean = false;
  isSubmitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private router: Router,
    private feedbackService: FeedbackService
  ) {
    this.projectForm = this.fb.group({
      // Personal Information
      name: ['', Validators.required],
      professionalStatus: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      linkedin: [''],

      // Project Information
      projectName: ['', Validators.required],
      category: ['', Validators.required], // New field
      otherCategory: [''], // New field for "Other" category
      location: ['', Validators.required],
      status: ['', Validators.required],
      prototypeLink: [''],
      employeesCount: [''],
      monthlyIncome: [''],
      websiteUrl: [''],
      incomeStatement: [null],
      cashFlowStatement: [null],
      balanceSheet: [null],
      speciality: ['', Validators.required],
      pitchingVideo: [null],

      // Sponsorship
      hasSponsorship: ['', Validators.required],
      sponsorName: [''],
      needsSponsor: ['', Validators.required],
      orginSponsorship: [''],
      sellProject: [''],
      projectInvestment: [''],

      // Intellectual Property
      wantsIP: ['', Validators.required],
      businessPlan: [null],
      needsBusinessPlan: [''],
      businessIdea: [''],
      businessIdeaDocument: [null], // New field

      // Confirmation Checkbox
      confirmationCheckbox: [false, Validators.requiredTrue], // New field
      projectThumbnail: [null], // Add this line
      projectDescription: [
        '',
        [Validators.required, Validators.minLength(20), Validators.maxLength(200)],
      ],

      // Add this new field
      purpose: ['', Validators.required],
    });
  }

  getFormData(): { label: string; value: any }[] {
    const categoryValue =
      this.projectForm.get('category')?.value === 'Other'
        ? this.projectForm.get('otherCategory')?.value
        : this.projectForm.get('category')?.value;

    return [
      {
        label: 'projectLaunch.fields.fullName',
        value: this.projectForm.get('name')?.value,
      },
      {
        label: 'projectLaunch.fields.professionalStatus',
        value: this.projectForm.get('professionalStatus')?.value,
      },
      {
        label: 'projectLaunch.fields.email',
        value: this.projectForm.get('email')?.value,
      },
      {
        label: 'projectLaunch.fields.phone',
        value: this.projectForm.get('phone')?.value,
      },
      {
        label: 'projectLaunch.fields.linkedin',
        value: this.projectForm.get('linkedin')?.value || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.projectName',
        value: this.projectForm.get('projectName')?.value,
      },
      {
        label: 'projectLaunch.fields.projectDescription',
        value:
          this.projectForm.get('projectDescription')?.value || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.category',
        value: categoryValue || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.location',
        value: this.projectForm.get('location')?.value,
      },
      {
        label: 'projectLaunch.fields.status',
        value: this.projectForm.get('status')?.value,
      },
      {
        label: 'projectLaunch.fields.prototypeLink',
        value: this.projectForm.get('prototypeLink')?.value || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.employeesCount',
        value: this.projectForm.get('employeesCount')?.value || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.monthlyIncome',
        value: this.projectForm.get('monthlyIncome')?.value || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.websiteUrl',
        value: this.projectForm.get('websiteUrl')?.value || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.incomeStatement',
        value: this.fileReferences['incomeStatement']?.name || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.cashFlowStatement',
        value: this.fileReferences['cashFlowStatement']?.name || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.balanceSheet',
        value: this.fileReferences['balanceSheet']?.name || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.speciality',
        value: this.projectForm.get('speciality')?.value || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.pitchingVideo',
        value: this.fileReferences['pitchingVideo']?.name || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.hasSponsorship',
        value: this.projectForm.get('hasSponsorship')?.value,
      },
      {
        label: 'projectLaunch.fields.sponsorName',
        value: this.projectForm.get('sponsorName')?.value || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.needsSponsor',
        value: this.projectForm.get('needsSponsor')?.value,
      },
      {
        label: 'projectLaunch.fields.orginSponsorship',
        value:
          this.projectForm.get('orginSponsorship')?.value || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.sellProject',
        value: this.projectForm.get('sellProject')?.value,
      },
      {
        label: 'projectLaunch.fields.projectInvestment',
        value:
          this.projectForm.get('projectInvestment')?.value || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.wantsIP',
        value: this.projectForm.get('wantsIP')?.value,
      },
      {
        label: 'projectLaunch.fields.businessPlan',
        value: this.fileReferences['businessPlan']?.name || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.needsBusinessPlan',
        value:
          this.projectForm.get('needsBusinessPlan')?.value || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.businessIdea',
        value: this.projectForm.get('businessIdea')?.value || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.businessIdeaDocument',
        value:
          this.fileReferences['businessIdeaDocument']?.name || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.projectThumbnail',
        value: this.fileReferences['projectThumbnail']?.name || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.purpose',
        value: this.projectForm.get('purpose')?.value || 'Not provided',
      },
    ];
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.updateFileInputs(this.currentStep);
      this.updateValidationForCurrentStep();
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateFileInputs(this.currentStep);
      this.updateValidationForCurrentStep();
    }
  }

  goToStep(index: number) {
    if (index >= 0 && index < this.steps.length) {
      this.currentStep = index;
      this.updateFileInputs(index);
      this.updateValidationForCurrentStep();
    }
  }
  onFileChange(event: Event, controlName: string) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];

      // Validate file type based on control name
      let isValid = true;
      switch (controlName) {
        case 'projectThumbnail':
          isValid = file.type.startsWith('image/');
          break;
        case 'pitchingVideo':
          isValid = file.type.startsWith('video/');
          break;
        case 'incomeStatement':
        case 'cashFlowStatement':
        case 'balanceSheet':
        case 'businessPlan':
        case 'businessIdeaDocument':
          isValid = file.type === 'application/pdf';
          break;
      }

      if (!isValid) {
        alert(
          `Invalid file type for ${controlName}. Please upload the correct file type.`
        );
        fileInput.value = ''; // Clear the invalid file
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
  getStepFields(step: number): string[] {
    switch (step) {
      case 0: // Personal Information
        return ['name', 'professionalStatus', 'email', 'phone', 'linkedin'];
      case 1: // Project Information
        return [
          'projectName',
          'projectDescription',
          'category',
          'otherCategory',
          'location',
          'status',
          'prototypeLink',
          'employeesCount',
          'monthlyIncome',
          'websiteUrl',
          'incomeStatement',
          'cashFlowStatement',
          'balanceSheet',
          'speciality',
          'pitchingVideo',
          'purpose',
          'projectThumbnail',
        ];
      case 2: // Sponsorship
        return [
          'hasSponsorship',
          'sponsorName',
          'needsSponsor',
          'orginSponsorship',
          'sellProject',
          'projectInvestment',
        ];
      case 3: // Intellectual Property
        return [
          'wantsIP',
          'businessPlan',
          'needsBusinessPlan',
          'businessIdea',
          'businessIdeaDocument',
        ];
      case 4: //review
        return ['confirmationCheckbox'];
      default:
        return [];
    }
  }
  onClear() {
    const stepFields = this.getStepFields(this.currentStep);

    stepFields.forEach((field) => {
      // Clear form control
      this.projectForm.get(field)?.reset();

      // Clear file input if it exists
      const fileInput = document.getElementById(field) as HTMLInputElement;
      if (fileInput && fileInput.type === 'file') {
        fileInput.value = '';
      }

      // Clear file reference if it exists
      if (this.fileReferences[field]) {
        delete this.fileReferences[field];
      }
    });
  }

  resetForm() {
    this.projectForm.reset();
    this.fileReferences = {
      projectThumbnail: null,
      incomeStatement: null,
      cashFlowStatement: null,
      balanceSheet: null,
      pitchingVideo: null,
      businessPlan: null,
      businessIdeaDocument: null,
    };
    this.currentStep = 0;
    this.isSubmitted = false;
    this.isSubmitting = false;

    // Reset all file inputs
    Object.keys(this.fileReferences).forEach((key) => {
      const fileInput = document.getElementById(key) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    });
  }

  async onSubmit() {
    if (this.projectForm.valid && !this.isSubmitting) {
      this.isSubmitting = true; // Disable submit button
      try {
        const projectData = {
          clientName: this.projectForm.get('name')?.value,
          professionalStatus: this.projectForm.get('professionalStatus')?.value,
          email: this.projectForm.get('email')?.value,
          phone: this.projectForm.get('phone')?.value,
          linkedIn: this.projectForm.get('linkedin')?.value,
          projectName: this.projectForm.get('projectName')?.value,
          category:
            this.projectForm.get('category')?.value === 'Other'
              ? this.projectForm.get('otherCategory')?.value
              : this.projectForm.get('category')?.value,
          description: this.projectForm.get('projectDescription')?.value,
          projectLocation: this.projectForm.get('location')?.value,
          projectPurpose: this.projectForm.get('purpose')?.value,
          projectStatus: this.projectForm.get('status')?.value,
          prototypeLink: this.projectForm.get('prototypeLink')?.value,
          numberOfEmp: this.projectForm.get('employeesCount')?.value,
          monthlyIncome: this.projectForm.get('monthlyIncome')?.value,
          websiteLink: this.projectForm.get('websiteUrl')?.value,
          specialityOfProject: this.projectForm.get('speciality')?.value,
          haveSponsorQ: this.projectForm
            .get('hasSponsorship')
            ?.value?.toLowerCase() || 'no',
          sponsorName: this.projectForm.get('sponsorName')?.value,
          needSponsorQ: this.projectForm
            .get('needsSponsor')
            ?.value?.toLowerCase() || 'no',
          needOrgQ: this.projectForm
            .get('orginSponsorship')
            ?.value?.toLowerCase() || 'no',
          doSellProjectQ: this.projectForm
            .get('sellProject')
            ?.value?.toLowerCase() || 'no',
          projectAmount: this.projectForm.get('projectInvestment')?.value,
          intellectualProjectQ: this.projectForm
            .get('wantsIP')
            ?.value?.toLowerCase() || 'no',
          wantOriginToBusinessPlanQ: this.projectForm
            .get('needsBusinessPlan')
            ?.value?.toLowerCase() || 'no',
          businessIdea: this.projectForm.get('businessIdea')?.value,
        };

        const response = await this.projectService.launchProject(
          projectData,
          this.fileReferences
        );

        if (response && response.includes('successfully')) {
          this.isSubmitted = true;
          alert('Your project has been submitted successfully!');
          this.resetForm(); // Reset the form after successful submission
          this.router.navigate(['/']);
        } else {
          alert(
            'An error occurred while submitting your project. Please try again.'
          );
        }
      } catch (error: any) {
        console.error('Error submitting project:', error);
        if (error.status === 401) {
          alert('Please upgrade your plan to launch a project.');
        } else if (error.status === 409) {
          alert('A project with this name already exists.');
        } else {
          alert(
            error.error ||
              'An error occurred while submitting your project. Please try again.'
          );
        }
      } finally {
        this.isSubmitting = false; // Re-enable submit button
      }
    } else {
      // Log validation errors for debugging
      Object.keys(this.projectForm.controls).forEach((key) => {
        const control = this.projectForm.get(key);
        if (control && control.invalid) {
          console.log(
            `Field: ${key}, Status: ${control.status}, Errors:`,
            control.errors
          );
        }
      });
      alert('Please fill in all required fields correctly.');
    }
  }

  updateFileInputs(step: number) {
    const stepFields = this.getStepFields(step);
    stepFields.forEach((field) => {
      const fileInput = document.getElementById(field) as HTMLInputElement;
      if (fileInput && fileInput.type === 'file') {
        if (this.fileReferences[field]) {
          // Set the form control value
          this.projectForm.get(field)?.setValue(this.fileReferences[field]);

          // Create a new FileList using DataTransfer
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(this.fileReferences[field]);
          fileInput.files = dataTransfer.files;

          // Trigger change event to update any UI bindings
          const event = new Event('change', { bubbles: true });
          fileInput.dispatchEvent(event);
        } else {
          // Clear the file input if no reference exists
          fileInput.value = '';
          this.projectForm.get(field)?.setValue(null);
        }
      }
    });
  }

  updateValidationForCurrentStep() {
    const stepFields = this.getStepFields(this.currentStep);

    // Loop through all form controls
    Object.keys(this.projectForm.controls).forEach((key) => {
      const control = this.projectForm.get(key);

      if (control) {
        if (stepFields.includes(key)) {
          // If the field is in the current step, add validators
          if (key === 'name') control.setValidators([Validators.required]);
          if (key === 'professionalStatus')
            control.setValidators([Validators.required]);
          if (key === 'email')
            control.setValidators([Validators.required, Validators.email]);
          if (key === 'phone') control.setValidators([Validators.required]);
          if (key === 'projectName')
            control.setValidators([Validators.required]);
          if (key === 'category') control.setValidators([Validators.required]);
          if (key === 'location') control.setValidators([Validators.required]);
          if (key === 'status') control.setValidators([Validators.required]);
          if (key === 'speciality')
            control.setValidators([Validators.required]);
          if (key === 'projectDescription')
            control.setValidators([
              Validators.required,
              Validators.minLength(20),
              Validators.maxLength(200)
            ]);
          if (key === 'hasSponsorship')
            control.setValidators([Validators.required]);
          if (key === 'needsSponsor')
            control.setValidators([Validators.required]);
          if (key === 'wantsIP') control.setValidators([Validators.required]);
          if (key === 'confirmationCheckbox')
            control.setValidators([Validators.requiredTrue]);
          if (key === 'purpose') control.setValidators([Validators.required]);
        } else {
          // If the field is not in the current step, clear validators
          control.clearValidators();
        }

        // Update the control's validity
        control.updateValueAndValidity();
      }
    });
  }

  testFeedback() {
    // Reset any previous feedback to allow testing multiple times
    this.feedbackService.resetFeedbackStatus();
    // Show the popup
    this.feedbackService.forceShowPopup();
  }
}
