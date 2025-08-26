import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../../../services/project.services';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.scss']
})
export class CommunityProjectUpdateComponent implements OnInit {
  projectForm: FormGroup;
  projectCategories = ['Technology', 'Healthcare', 'Education', 'Finance', 'Agriculture', 'Retail', 'Other'];
  steps = ['Personal Information', 'Project Information', 'Review and Submit'];
  currentStep = 0;
  projectId: string | null = null;
  isLoading = true;
  isSubmitting = false;



  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {
    this.projectForm = this.fb.group({
      // Personal Information
      fullName: ['', Validators.required],
      professionalStatus: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      linkedin: [''],
      
      // Project Information
      projectName: ['', Validators.required],
      category: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required],
      

      
      // Confirmation
      confirmationCheckbox: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.loadProject();
  }

  async loadProject(): Promise<void> {
    if (this.projectId) {
      try {
        const project = await this.projectService.getCommunityProjectById(this.projectId);
        this.populateForm(project);
      } catch (error) {
        console.error('Error loading project:', error);
        // Handle error - could show a message to user
      }
    }
    this.isLoading = false;
  }

  populateForm(project: any): void {
    this.projectForm.patchValue({
      fullName: project.fullName,
      professionalStatus: project.profession, // Map profession to professionalStatus
      email: project.email,
      phone: project.phone,
      linkedin: project.linkedIn, // Map linkedIn to linkedin
      projectName: project.projectName,
      category: project.category,
      location: project.location,
      description: project.description
    });
  }



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

  async onSubmit(): Promise<void> {
    if (this.projectForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    try {
      const formData = this.projectForm.value;
      
      // Map form data to API format
      const projectData = {
        fullName: formData.fullName,
        profession: formData.professionalStatus, // Map professionalStatus to profession
        email: formData.email,
        phone: formData.phone,
        linkedIn: formData.linkedin, // Map linkedin to linkedIn
        projectName: formData.projectName,
        category: formData.category,
        location: formData.location,
        description: formData.description
      };

      if (this.projectId) {
        await this.projectService.updateCommunityProject(this.projectId, projectData);
        console.log('Project updated successfully');
        
        this.router.navigate(['dashboard/project/my-projects'], {
          queryParams: { updated: true }
        });
      }
    } catch (error) {
      console.error('Update failed:', error);
      // Handle error - could show a message to user
    } finally {
      this.isSubmitting = false;
    }
  }



  onClear() {
    const stepFields = this.getStepFields(this.currentStep);
    stepFields.forEach(field => {
      this.projectForm.get(field)?.reset();
    });
  }

  getStepFields(step: number): string[] {
    switch (step) {
      case 0: // Personal Information
        return ['fullName', 'professionalStatus', 'email', 'phone', 'linkedin'];
      case 1: // Project Information
        return ['projectName', 'category', 'location', 'description'];
      case 2: // Review and Submit
        return ['confirmationCheckbox'];
      default:
        return [];
    }
  }

  getFormData(): { label: string, value: any }[] {
    return [
      { label: 'Full Name', value: this.projectForm.get('fullName')?.value },
      { label: 'Professional Status', value: this.projectForm.get('professionalStatus')?.value },
      { label: 'Email', value: this.projectForm.get('email')?.value },
      { label: 'Phone', value: this.projectForm.get('phone')?.value },
      { label: 'LinkedIn', value: this.projectForm.get('linkedin')?.value || 'Not provided' },
      { label: 'Project Name', value: this.projectForm.get('projectName')?.value },
      { label: 'Category', value: this.projectForm.get('category')?.value },
      { label: 'Location', value: this.projectForm.get('location')?.value },
      { label: 'Description', value: this.projectForm.get('description')?.value }
    ];
  }


}
