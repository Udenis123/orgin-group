import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';




@Component({
  selector: 'app-project-order',
  standalone: true,
  templateUrl: './project-order.component.html',
  styleUrls: ['./project-order.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, TranslateModule]
})
export class ProjectOrderComponent {
  projectForm: FormGroup;
  projectTypes = ['Web Application', 'Mobile Application', 'Desktop Software', 'AI/ML Solution', 'Blockchain', 'Other'];
  projectComplexities = ['Simple', 'Medium', 'Complex'];
  steps = ['Client Information', 'Project Details', 'Technical Requirements', 'Budget & Timeline', 'Review and Submit'];
  currentStep = 0;

  constructor(private fb: FormBuilder) {
    this.projectForm = this.fb.group({
      // Client Information
      clientName: [''],
      companyName: [''],
      professionalStatus: [''],
      email: [''],
      phone: [''],
      linkedin: [''],

      // Project Details
      projectTitle: [''],
      projectType: [''],
      otherProjectType: [''],
      projectDescription: [''],
      targetAudience: [''],
      references: [''],
      location: [''],
      speciality: [''],
      status: [''],
      prototypeLink: [''],
      employeesCount: [''],
      monthlyIncome: [''],
      websiteUrl: [''],
      incomeStatement: [null],
      cashFlowStatement: [null],
      balanceSheet: [null],

      // Sponsorship
      hasSponsorship: [''],
      sponsorName: [''],
      needsSponsor: [''],
      orginSponsorship: [''],

      // Intellectual Property
      wantsIP: [''],
      businessPlan: [null],
      needsBusinessPlan: [''],
      businessIdea: [''],
      businessIdeaDocument: [null],

      // Confirmation
      confirmationCheckbox: [false]
    });
  }

  getFormData(): { label: string, value: any }[] {
    const projectTypeValue = this.projectForm.get('projectType')?.value === 'Other' 
      ? this.projectForm.get('otherProjectType')?.value 
      : this.projectForm.get('projectType')?.value;

    return [
      { label: 'projectOrder.fields.clientName', value: this.projectForm.get('clientName')?.value },
      { label: 'projectOrder.fields.companyName', value: this.projectForm.get('companyName')?.value || 'Not provided' },
      { label: 'projectOrder.fields.professionalStatus', value: this.projectForm.get('professionalStatus')?.value },
      { label: 'projectOrder.fields.email', value: this.projectForm.get('email')?.value },
      { label: 'projectOrder.fields.phone', value: this.projectForm.get('phone')?.value },
      { label: 'projectOrder.fields.linkedin', value: this.projectForm.get('linkedin')?.value || 'Not provided' },
      { label: 'projectOrder.fields.projectTitle', value: this.projectForm.get('projectTitle')?.value },
      { label: 'projectOrder.fields.projectType', value: projectTypeValue || 'Not provided' },
      { label: 'projectOrder.fields.projectDescription', value: this.projectForm.get('projectDescription')?.value },
      { label: 'projectOrder.fields.targetAudience', value: this.projectForm.get('targetAudience')?.value || 'Not provided' },
      { label: 'projectOrder.fields.references', value: this.projectForm.get('references')?.value || 'Not provided' },
      { label: 'projectOrder.fields.location', value: this.projectForm.get('location')?.value || 'Not provided' },
      { label: 'projectOrder.fields.speciality', value: this.projectForm.get('speciality')?.value || 'Not provided' },
      { label: 'projectOrder.fields.status', value: this.projectForm.get('status')?.value || 'Not provided' },
      { label: 'projectOrder.fields.prototypeLink', value: this.projectForm.get('prototypeLink')?.value || 'Not provided' },
      { label: 'projectOrder.fields.employeesCount', value: this.projectForm.get('employeesCount')?.value || 'Not provided' },
      { label: 'projectOrder.fields.monthlyIncome', value: this.projectForm.get('monthlyIncome')?.value || 'Not provided' },
      { label: 'projectOrder.fields.websiteUrl', value: this.projectForm.get('websiteUrl')?.value || 'Not provided' },
      { label: 'projectOrder.fields.incomeStatement', value: this.projectForm.get('incomeStatement')?.value ? 'Yes' : 'No' },
      { label: 'projectOrder.fields.cashFlowStatement', value: this.projectForm.get('cashFlowStatement')?.value ? 'Yes' : 'No' },
      { label: 'projectOrder.fields.balanceSheet', value: this.projectForm.get('balanceSheet')?.value ? 'Yes' : 'No' },
      { label: 'projectOrder.fields.hasSponsorship', value: this.projectForm.get('hasSponsorship')?.value || 'Not provided' },
      { label: 'projectOrder.fields.sponsorName', value: this.projectForm.get('sponsorName')?.value || 'Not provided' },
      { label: 'projectOrder.fields.needsSponsor', value: this.projectForm.get('needsSponsor')?.value || 'Not provided' },
      { label: 'projectOrder.fields.orginSponsorship', value: this.projectForm.get('orginSponsorship')?.value || 'Not provided' },
      { label: 'projectOrder.fields.wantsIP', value: this.projectForm.get('wantsIP')?.value || 'Not provided' },
      { label: 'projectOrder.fields.businessPlan', value: this.projectForm.get('businessPlan')?.value ? 'Yes' : 'No' },
      { label: 'projectOrder.fields.needsBusinessPlan', value: this.projectForm.get('needsBusinessPlan')?.value || 'Not provided' },
      { label: 'projectOrder.fields.businessIdea', value: this.projectForm.get('businessIdea')?.value || 'Not provided' },
      { label: 'projectOrder.fields.businessIdeaDocument', value: this.projectForm.get('businessIdeaDocument')?.value ? 'Yes' : 'No' },
      { label: 'projectOrder.fields.confirmationCheckbox', value: this.projectForm.get('confirmationCheckbox')?.value ? 'Confirmed' : 'Not confirmed' }
    ];
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

  onFileChange(event: any, controlName: string) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.projectForm.get(controlName)?.setValue(file);
    }
  }

  getStepFields(step: number): string[] {
    switch (step) {
      case 0: // Client Information
        return ['clientName', 'companyName', 'professionalStatus', 'email', 'phone', 'linkedin'];
      case 1: // Project Details
        return ['projectTitle', 'projectType', 'otherProjectType', 'projectDescription', 'targetAudience', 
                'references', 'location', 'speciality', 'status', 'prototypeLink', 'employeesCount', 
                'monthlyIncome', 'websiteUrl', 'incomeStatement', 'cashFlowStatement', 'balanceSheet'];
      case 2: // Sponsorship
        return ['hasSponsorship', 'sponsorName', 'needsSponsor', 'orginSponsorship'];
      case 3: // Intellectual Property
        return ['wantsIP', 'businessPlan', 'needsBusinessPlan', 'businessIdea', 'businessIdeaDocument'];
      case 4: // Review and Submit
        return ['confirmationCheckbox'];
      default:
        return [];
    }
  }

  onClear() {
    const stepFields = this.getStepFields(this.currentStep);
    stepFields.forEach(field => {
      this.projectForm.get(field)?.reset();
    });
  }

  onSubmit() {
    if (this.projectForm.valid) {
      console.log(this.projectForm.value);
      alert('Your project has been submitted successfully!');
      // Redirect to landing page on port 4202
      window.location.href = 'http://localhost:4202';
    }
  }
}