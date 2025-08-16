import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

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
  steps = ['Personal Information', 'Project Information', 'Team Requirements', 'Review and Submit'];
  currentStep = 0;
  projectId: string | null = null;
  isLoading = true;
  isSubmitting = false;

  private dummyProjects: { [key: string]: any } = {
    '7': {
      id: '7',
      fullName: 'John Doe',
      professionalStatus: 'Developer',
      email: 'john@example.com',
      phone: '111-222-3333',
      linkedin: 'https://linkedin.com/in/johndoe',
      projectName: 'Community Garden App',
      category: 'Agriculture',
      location: 'New York',
      description: 'Platform for urban gardening communities',
      requiredMembers: [
        { profession: 'Gardener', quantity: 3 },
        { profession: 'Developer', quantity: 2 }
      ]
    },
    '8': {
      id: '8',
      fullName: 'Jane Smith',
      professionalStatus: 'Entrepreneur',
      email: 'jane@example.com',
      phone: '444-555-6666',
      linkedin: 'https://linkedin.com/in/janesmith',
      projectName: 'Recycling Initiative',
      category: 'Environment',
      location: 'San Francisco',
      description: 'Community-based recycling program',
      requiredMembers: [
        { profession: 'Coordinator', quantity: 2 },
        { profession: 'Volunteer', quantity: 10 }
      ]
    },
    '9': {
      id: '9',
      fullName: 'Mike Johnson',
      professionalStatus: 'Community Leader',
      email: 'mike@example.com',
      phone: '777-888-9999',
      linkedin: 'https://linkedin.com/in/mikejohnson',
      projectName: 'Neighborhood Watch App',
      category: 'Technology',
      location: 'Chicago',
      description: 'Safety app for local communities',
      requiredMembers: [
        { profession: 'Developer', quantity: 3 },
        { profession: 'Security Expert', quantity: 2 }
      ]
    }
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
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
      
      // Team Requirements
      requiredMembers: this.fb.array([
        this.fb.group({
          profession: ['', Validators.required],
          quantity: [0, [Validators.required, Validators.min(0)]]
        })
      ]),
      
      // Confirmation
      confirmationCheckbox: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.loadProject();
  }

  loadProject(): void {
    if (this.projectId && this.dummyProjects[this.projectId]) {
      const project = this.dummyProjects[this.projectId];
      this.populateForm(project);
    }
    this.isLoading = false;
  }

  populateForm(project: any): void {
    this.projectForm.patchValue({
      fullName: project.fullName,
      professionalStatus: project.professionalStatus,
      email: project.email,
      phone: project.phone,
      linkedin: project.linkedin,
      projectName: project.projectName,
      category: project.category,
      location: project.location,
      description: project.description
    });

    // Clear existing required members
    while (this.requiredMembers.length) {
      this.requiredMembers.removeAt(0);
    }

    // Add new required members
    project.requiredMembers.forEach((member: any) => {
      this.requiredMembers.push(this.fb.group({
        profession: [member.profession],
        quantity: [member.quantity, [Validators.min(0)]]
      }));
    });
  }

  get requiredMembers() {
    return this.projectForm.get('requiredMembers') as FormArray;
  }

  getProfessionControl(index: number): FormControl {
    const control = this.requiredMembers.at(index).get('profession');
    if (!control) {
      throw new Error(`Profession control not found at index ${index}`);
    }
    return control as FormControl;
  }

  getQuantityControl(index: number): FormControl {
    const control = this.requiredMembers.at(index).get('quantity');
    if (!control) {
      throw new Error(`Quantity control not found at index ${index}`);
    }
    return control as FormControl;
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Form submitted with:', this.projectForm.value);
      
      this.router.navigate(['dashboard/project/my-projects'], {
        queryParams: { updated: true }
      });
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  onFileChange(event: any, controlName: string) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.projectForm.get(controlName)?.setValue(file);
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
      case 2: // Team Requirements
        return ['requiredMembers'];
      case 3: // Review and Submit
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
      { label: 'Description', value: this.projectForm.get('description')?.value },
      ...this.requiredMembers.controls.map((member, index) => ({
        label: `Required ${member.get('profession')?.value}`, 
        value: member.get('quantity')?.value
      }))
    ];
  }

  addMember() {
    this.requiredMembers.push(this.fb.group({
      profession: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]]
    }));
  }
}
