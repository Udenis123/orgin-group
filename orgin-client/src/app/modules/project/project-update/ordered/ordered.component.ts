import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../../services/project.services';

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
  project: any;
  isSubmitting = false;

  private dummyProjects: { [key: string]: any } = {
    '4': {
      id: '4',
      // Client Information
      clientName: 'John Doe',
      companyName: 'Tech Solutions',
      professionalStatus: 'Developer',
      email: 'john@example.com',
      phone: '111-222-3333',
      linkedin: 'https://linkedin.com/in/johndoe',
      
      // Project Details
      projectTitle: 'AI Chatbot Platform',
      projectType: 'AI/ML Solution',
      otherProjectType: '',
      projectDescription: 'An AI-powered chatbot for customer service',
      targetAudience: 'E-commerce businesses',
      references: 'ChatGPT, Dialogflow',
      location: 'San Francisco',
      speciality: 'AI and Machine Learning',
      status: 'Prototype',
      prototypeLink: 'https://prototype.com',
      employeesCount: 5,
      monthlyIncome: 10000,
      websiteUrl: 'https://aichatbot.com',
      incomeStatement: null,
      cashFlowStatement: null,
      balanceSheet: null,
      
      // Sponsorship
      hasSponsorship: 'No',
      sponsorName: '',
      needsSponsor: 'Yes',
      orginSponsorship: 'No',
      
      // Intellectual Property
      wantsIP: 'Yes',
      businessPlan: null,
      needsBusinessPlan: 'No',
      businessIdea: 'Creating an AI chatbot for customer service',
      businessIdeaDocument: null,
      
      // Confirmation
      confirmationCheckbox: true
    },
    '2': {
      id: '2',
      // Client Information
      clientName: 'Jane Smith',
      companyName: 'Green Energy Inc.',
      professionalStatus: 'Entrepreneur',
      email: 'jane@greenenergy.com',
      phone: '444-555-6666',
      linkedin: 'https://linkedin.com/in/janesmith',
      
      // Project Details
      projectTitle: 'Solar Panel Monitoring System',
      projectType: 'IoT Solution',
      otherProjectType: '',
      projectDescription: 'Real-time monitoring of solar panel efficiency',
      targetAudience: 'Solar energy companies',
      references: 'SolarEdge, Enphase',
      location: 'Austin',
      speciality: 'Renewable Energy Technology',
      status: 'Operating',
      prototypeLink: '',
      employeesCount: 15,
      monthlyIncome: 50000,
      websiteUrl: 'https://greenmonitor.com',
      incomeStatement: null,
      cashFlowStatement: null,
      balanceSheet: null,
      
      // Sponsorship
      hasSponsorship: 'Yes',
      sponsorName: 'Energy Foundation',
      needsSponsor: 'No',
      orginSponsorship: 'No',
      
      // Intellectual Property
      wantsIP: 'Yes',
      businessPlan: null,
      needsBusinessPlan: 'Yes',
      businessIdea: 'Developing IoT solutions for renewable energy monitoring',
      businessIdeaDocument: null,
      
      // Confirmation
      confirmationCheckbox: true
    }
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {
    this.projectForm = this.fb.group({
      // Client Information
      clientName: ['', Validators.required],
      companyName: [''],
      professionalStatus: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      linkedin: [''],

      // Project Details
      projectTitle: ['', Validators.required],
      projectType: ['', Validators.required],
      otherProjectType: [''],
      projectDescription: ['', Validators.required],
      targetAudience: [''],
      references: [''],
      location: ['', Validators.required],
      speciality: ['', Validators.required],
      status: [''],
      prototypeLink: [''],
      employeesCount: [''],
      monthlyIncome: [''],
      websiteUrl: [''],
      incomeStatement: [null],
      cashFlowStatement: [null],
      balanceSheet: [null],

      // Sponsorship
      hasSponsorship: ['', Validators.required],
      sponsorName: [''],
      needsSponsor: [''],
      orginSponsorship: [''],

      // Intellectual Property
      wantsIP: ['', Validators.required],
      businessPlan: [null],
      needsBusinessPlan: [''],
      businessIdea: [''],
      businessIdeaDocument: [null],

      // Confirmation
      confirmationCheckbox: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.loadProject();
  }

  async loadProject(): Promise<void> {
    if (this.projectId && this.dummyProjects[this.projectId]) {
      this.project = this.dummyProjects[this.projectId];
      this.projectForm.patchValue(this.project);
    }
  }

  onSubmit() {
    // Handle form submission logic
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  onClear() {
    // Handle clear/reset logic
    this.projectForm.reset();
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
        { label: 'projectOrder.fields.status', value: this.projectForm.get('status')?.value || 'Not provided' },
        { label: 'projectOrder.fields.prototypeLink', value: this.projectForm.get('prototypeLink')?.value || 'Not provided' },
        { label: 'projectOrder.fields.employeesCount', value: this.projectForm.get('employeesCount')?.value || 'Not provided' },
        { label: 'projectOrder.fields.monthlyIncome', value: this.projectForm.get('monthlyIncome')?.value || 'Not provided' },
        { label: 'projectOrder.fields.websiteUrl', value: this.projectForm.get('websiteUrl')?.value || 'Not provided' },
        { label: 'projectOrder.fields.incomeStatement', value: this.projectForm.get('incomeStatement')?.value ? 'Uploaded' : 'Not provided' },
        { label: 'projectOrder.fields.cashFlowStatement', value: this.projectForm.get('cashFlowStatement')?.value ? 'Uploaded' : 'Not provided' },
        { label: 'projectOrder.fields.balanceSheet', value: this.projectForm.get('balanceSheet')?.value ? 'Uploaded' : 'Not provided' },

        // Sponsorship
        { label: 'projectOrder.fields.hasSponsorship', value: this.projectForm.get('hasSponsorship')?.value || 'Not provided' },
        { label: 'projectOrder.fields.sponsorName', value: this.projectForm.get('sponsorName')?.value || 'Not provided' },
        { label: 'projectOrder.fields.needsSponsor', value: this.projectForm.get('needsSponsor')?.value || 'Not provided' },
        { label: 'projectOrder.fields.orginSponsorship', value: this.projectForm.get('orginSponsorship')?.value || 'Not provided' },

        // Intellectual Property
        { label: 'projectOrder.fields.wantsIP', value: this.projectForm.get('wantsIP')?.value || 'Not provided' },
        { label: 'projectOrder.fields.businessPlan', value: this.projectForm.get('businessPlan')?.value ? 'Uploaded' : 'Not provided' },
        { label: 'projectOrder.fields.needsBusinessPlan', value: this.projectForm.get('needsBusinessPlan')?.value || 'Not provided' },
        { label: 'projectOrder.fields.businessIdea', value: this.projectForm.get('businessIdea')?.value || 'Not provided' },
        { label: 'projectOrder.fields.businessIdeaDocument', value: this.projectForm.get('businessIdeaDocument')?.value ? 'Uploaded' : 'Not provided' }
    ];
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

  onFileChange(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.projectForm.get(controlName)?.setValue(file);
    }
  }
}
