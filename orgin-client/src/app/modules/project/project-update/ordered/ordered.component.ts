import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../../services/project.services';

interface OrderedProject {
  projectId: string;
  userId: string;
  clientName: string;
  companyName?: string;
  professionalStatus: string;
  email: string;
  phone: string;
  linkedIn?: string;
  projectTitle: string;
  projectType: string;
  projectDescription: string;
  targetAudience?: string;
  references?: string;
  projectLocation: string;
  specialityOfProject: string;
  doYouHaveSponsorship: string;
  sponsorName?: string;
  doYouNeedIntellectualProject: string;
  doYouNeedBusinessPlan: string;
  businessIdea?: string;
  businessIdeaDocumentUrl?: string;
  businessPlanUrl?: string;
  status: string;
  reasons?: string;
}

interface OrderedProjectData {
  clientName: string;
  companyName?: string;
  professionalStatus: string;
  email: string;
  phone: string;
  linkedIn?: string;
  projectTitle: string;
  projectType: string;
  projectDescription: string;
  targetAudience?: string;
  references?: string;
  projectLocation: string;
  specialityOfProject: string;
  doYouHaveSponsorship: string;
  sponsorName?: string;
  doYouNeedIntellectualProject: string;
  doYouNeedBusinessPlan: string;
  businessIdea?: string;
}

@Component({
  selector: 'app-ordered',
  standalone: true,
  templateUrl: './ordered.component.html',
  styleUrls: ['./ordered.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, TranslateModule]
})
export class OrderedProjectUpdateComponent implements OnInit {
  projectForm: FormGroup;
  projectTypes = ['Web Application', 'Mobile Application', 'Desktop Software', 'AI/ML Solution', 'Blockchain', 'Other'];
  steps = ['Client Information', 'Project Details', 'Sponsorship', 'Intellectual Property', 'Review and Submit'];
  currentStep = 0;
  projectId: string | null = null;
  project: OrderedProject | null = null;
  isSubmitting = false;
  isLoading = false;
  error: string | null = null;
  existingBusinessIdeaDocumentUrl: string | null = null;
  existingBusinessPlanUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {
    this.projectForm = this.fb.group({
      // Client Information
      clientName: ['', [Validators.required, Validators.maxLength(255)]],
      companyName: ['', Validators.maxLength(255)],
      professionalStatus: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      phone: ['', [Validators.required, Validators.maxLength(255)]],
      linkedin: ['', Validators.maxLength(255)],

      // Project Details
      projectTitle: ['', [Validators.required, Validators.maxLength(255)]],
      projectType: ['', Validators.required],
      otherProjectType: ['', Validators.maxLength(255)],
      projectDescription: ['', [Validators.required, Validators.maxLength(255)]],
      targetAudience: ['', Validators.maxLength(255)],
      references: ['', Validators.maxLength(255)],
      location: ['', [Validators.required, Validators.maxLength(255)]],
      speciality: ['', [Validators.required, Validators.maxLength(255)]],

      // Sponsorship
      hasSponsorship: ['', Validators.required],
      sponsorName: ['', Validators.maxLength(255)],

      // Intellectual Property
      wantsIP: ['', Validators.required],
      businessPlan: [null],
      needsBusinessPlan: ['', Validators.maxLength(255)],
      businessIdea: ['', Validators.maxLength(255)],
      businessIdeaDocument: [null],

      // Confirmation
      confirmationCheckbox: [false, Validators.requiredTrue]
    });

    // Add conditional validation for otherProjectType
    this.projectForm.get('projectType')?.valueChanges.subscribe(value => {
      const otherProjectTypeControl = this.projectForm.get('otherProjectType');
      if (value === 'Other') {
        otherProjectTypeControl?.setValidators([Validators.required, Validators.maxLength(255)]);
      } else {
        otherProjectTypeControl?.clearValidators();
      }
      otherProjectTypeControl?.updateValueAndValidity();
    });

    // Add conditional validation for sponsorName
    this.projectForm.get('hasSponsorship')?.valueChanges.subscribe(value => {
      const sponsorNameControl = this.projectForm.get('sponsorName');
      if (value === 'Yes') {
        sponsorNameControl?.setValidators([Validators.required, Validators.maxLength(255)]);
      } else {
        sponsorNameControl?.clearValidators();
      }
      sponsorNameControl?.updateValueAndValidity();
    });

    // Add conditional validation for businessIdea and needsBusinessPlan
    this.projectForm.get('wantsIP')?.valueChanges.subscribe(value => {
      const businessIdeaControl = this.projectForm.get('businessIdea');
      const needsBusinessPlanControl = this.projectForm.get('needsBusinessPlan');
      
      if (value === 'Yes') {
        businessIdeaControl?.setValidators([Validators.required, Validators.maxLength(255)]);
        needsBusinessPlanControl?.setValidators([Validators.required, Validators.maxLength(255)]);
      } else {
        businessIdeaControl?.clearValidators();
        needsBusinessPlanControl?.clearValidators();
      }
      businessIdeaControl?.updateValueAndValidity();
      needsBusinessPlanControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    if (this.projectId) {
      this.loadProject();
    } else {
      this.error = 'Project ID is required';
    }
  }

  async loadProject(): Promise<void> {
    if (!this.projectId) return;

    this.isLoading = true;
    this.error = null;

    try {
      const project = await this.projectService.getOrderedProjectById(this.projectId);
      this.project = project;
      
      // Store existing document URLs
      this.existingBusinessIdeaDocumentUrl = project.businessIdeaDocumentUrl || null;
      this.existingBusinessPlanUrl = project.businessPlanUrl || null;
      
      // Map backend fields to form fields
      const formData = {
        clientName: project.clientName,
        companyName: project.companyName || '',
        professionalStatus: project.professionalStatus,
        email: project.email,
        phone: project.phone,
        linkedin: project.linkedIn || '',
        projectTitle: project.projectTitle,
        projectType: project.projectType,
        otherProjectType: project.projectType === 'Other' ? project.projectType : '',
        projectDescription: project.projectDescription,
        targetAudience: project.targetAudience || '',
        references: project.references || '',
        location: project.projectLocation,
        speciality: project.specialityOfProject,
        hasSponsorship: project.doYouHaveSponsorship,
        sponsorName: project.sponsorName || '',
        wantsIP: project.doYouNeedIntellectualProject,
        needsBusinessPlan: project.doYouNeedBusinessPlan,
        businessIdea: project.businessIdea || '',
        businessPlan: null,
        businessIdeaDocument: null,
        confirmationCheckbox: false
      };

      this.projectForm.patchValue(formData);
    } catch (error) {
      console.error('Error loading project:', error);
      this.error = 'Failed to load project. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit() {
    if (this.projectForm.valid && !this.isSubmitting && this.projectId) {
      this.isSubmitting = true;
      
      try {
        // Prepare the project data according to the backend DTO structure
        const projectData: OrderedProjectData = {
          clientName: this.projectForm.get('clientName')?.value,
          companyName: this.projectForm.get('companyName')?.value,
          professionalStatus: this.projectForm.get('professionalStatus')?.value,
          email: this.projectForm.get('email')?.value,
          phone: this.projectForm.get('phone')?.value,
          linkedIn: this.projectForm.get('linkedin')?.value,
          projectTitle: this.projectForm.get('projectTitle')?.value,
          projectType: this.projectForm.get('projectType')?.value === 'Other' 
            ? this.projectForm.get('otherProjectType')?.value 
            : this.projectForm.get('projectType')?.value,
          projectDescription: this.projectForm.get('projectDescription')?.value,
          targetAudience: this.projectForm.get('targetAudience')?.value,
          references: this.projectForm.get('references')?.value,
          projectLocation: this.projectForm.get('location')?.value,
          specialityOfProject: this.projectForm.get('speciality')?.value,
          doYouHaveSponsorship: this.projectForm.get('hasSponsorship')?.value,
          sponsorName: this.projectForm.get('sponsorName')?.value,
          doYouNeedIntellectualProject: this.projectForm.get('wantsIP')?.value,
          doYouNeedBusinessPlan: this.projectForm.get('needsBusinessPlan')?.value,
          businessIdea: this.projectForm.get('businessIdea')?.value
        };

        // Prepare files - only include files that are actually provided
        const files: { [key: string]: File | null } = {};
        const businessIdeaDocument = this.projectForm.get('businessIdeaDocument')?.value;
        const businessPlanDocument = this.projectForm.get('businessPlan')?.value;
        
        console.log('Files to upload:', { businessIdeaDocument, businessPlanDocument });
        
        if (businessIdeaDocument) {
          files['businessIdeaDocument'] = businessIdeaDocument;
          console.log('Adding businessIdeaDocument to upload:', businessIdeaDocument.name);
        }
        if (businessPlanDocument) {
          files['businessPlanDocument'] = businessPlanDocument;
          console.log('Adding businessPlanDocument to upload:', businessPlanDocument.name);
        }
        
        console.log('Final files object:', files);

        // Call the service to update the ordered project
        await this.projectService.updateOrderedProject(this.projectId, projectData, files);
        
        console.log('Project updated successfully');
        alert('Your project has been updated successfully!');
        
        // Navigate back to my projects page
        this.router.navigate(['dashboard/project/my-projects'], { 
          queryParams: { updated: 'true' } 
        });
      } catch (error: any) {
        console.error('Error updating project:', error);
        let errorMessage = 'There was an error updating your project. Please try again.';
        
        if (error.status === 400) {
          errorMessage = 'Please check your form data and try again.';
        } else if (error.status === 401) {
          errorMessage = 'Please log in again to update your project.';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please check that your input is not too long (maximum 255 characters per field) and try again.';
        }
        
        alert(errorMessage);
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      // Check if current step is valid before proceeding
      const stepFields = this.getStepFields(this.currentStep);
      const isStepValid = stepFields.every(field => {
        const control = this.projectForm.get(field);
        return control && control.valid;
      });
      
      if (isStepValid) {
        this.currentStep++;
      } else {
        // Mark all fields in current step as touched to show validation errors
        stepFields.forEach(field => {
          const control = this.projectForm.get(field);
          if (control) {
            control.markAsTouched();
          }
        });
      }
    }
  }

  onClear() {
    const stepFields = this.getStepFields(this.currentStep);
    stepFields.forEach(field => {
      this.projectForm.get(field)?.reset();
    });
  }

  getFormData(): { label: string, value: any }[] {
    const projectTypeValue = this.projectForm.get('projectType')?.value === 'Other' 
        ? this.projectForm.get('otherProjectType')?.value 
        : this.projectForm.get('projectType')?.value;

    return [
        // Client Information
        { label: 'projectOrder.fields.clientName', value: this.projectForm.get('clientName')?.value },
        { label: 'projectOrder.fields.companyName', value: this.projectForm.get('companyName')?.value || 'Not provided' },
        { label: 'projectOrder.fields.professionalStatus', value: this.projectForm.get('professionalStatus')?.value },
        { label: 'projectOrder.fields.email', value: this.projectForm.get('email')?.value },
        { label: 'projectOrder.fields.phone', value: this.projectForm.get('phone')?.value },
        { label: 'projectOrder.fields.linkedin', value: this.projectForm.get('linkedin')?.value || 'Not provided' },

        // Project Details
        { label: 'projectOrder.fields.projectTitle', value: this.projectForm.get('projectTitle')?.value },
        { label: 'projectOrder.fields.projectType', value: projectTypeValue },
        { label: 'projectOrder.fields.projectDescription', value: this.projectForm.get('projectDescription')?.value },
        { label: 'projectOrder.fields.targetAudience', value: this.projectForm.get('targetAudience')?.value || 'Not provided' },
        { label: 'projectOrder.fields.references', value: this.projectForm.get('references')?.value || 'Not provided' },
        { label: 'projectOrder.fields.location', value: this.projectForm.get('location')?.value },
        { label: 'projectOrder.fields.speciality', value: this.projectForm.get('speciality')?.value },

        // Sponsorship
        { label: 'projectOrder.fields.hasSponsorship', value: this.projectForm.get('hasSponsorship')?.value || 'Not provided' },
        { label: 'projectOrder.fields.sponsorName', value: this.projectForm.get('sponsorName')?.value || 'Not provided' },

        // Intellectual Property
        { label: 'projectOrder.fields.wantsIP', value: this.projectForm.get('wantsIP')?.value || 'Not provided' },
        { label: 'projectOrder.fields.businessPlan', value: this.getDocumentStatus('businessPlan', this.existingBusinessPlanUrl) },
        { label: 'projectOrder.fields.needsBusinessPlan', value: this.projectForm.get('needsBusinessPlan')?.value || 'Not provided' },
        { label: 'projectOrder.fields.businessIdea', value: this.projectForm.get('businessIdea')?.value || 'Not provided' },
        { label: 'projectOrder.fields.businessIdeaDocument', value: this.getDocumentStatus('businessIdeaDocument', this.existingBusinessIdeaDocumentUrl) }
    ];
  }

  getStepFields(step: number): string[] {
    switch (step) {
      case 0: // Client Information
        return ['clientName', 'companyName', 'professionalStatus', 'email', 'phone', 'linkedin'];
      case 1: // Project Details
        return ['projectTitle', 'projectType', 'otherProjectType', 'projectDescription', 'targetAudience', 
                'references', 'location', 'speciality'];
      case 2: // Sponsorship
        return ['hasSponsorship', 'sponsorName'];
      case 3: // Intellectual Property
        return ['wantsIP', 'businessPlan', 'needsBusinessPlan', 'businessIdea', 'businessIdeaDocument'];
      case 4: // Review and Submit
        return ['confirmationCheckbox'];
      default:
        return [];
    }
  }

  onFileChange(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.projectForm.get(controlName)?.setValue(file);
    }
  }

  getDocumentStatus(controlName: string, existingUrl: string | null): string {
    const newFile = this.projectForm.get(controlName)?.value;
    if (newFile) {
      return `New file: ${newFile.name}`;
    } else if (existingUrl) {
      return 'Existing document available';
    } else {
      return 'Not provided';
    }
  }
}
