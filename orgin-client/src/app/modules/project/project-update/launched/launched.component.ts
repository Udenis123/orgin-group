import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../../services/project.services';
import { Project } from '../../project.module';

@Component({
  selector: 'app-launched',
  standalone: true,
  templateUrl: './launched.component.html',
  styleUrls: ['./launched.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
})
export class LaunchedProjectUpdateComponent implements OnInit {
  projectForm!: FormGroup;
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
  projectId: string | null = null;
  project: Project | null = null;
  isSubmitting = false;
  fileReferences: { [key: string]: File | null } = {
    projectThumbnail: null,
    incomeStatement: null,
    cashFlowStatement: null,
    balanceSheet: null,
    pitchingVideo: null,
    businessPlan: null,
    businessIdeaDocument: null,
  };
  fileChanged: { [key: string]: boolean } = {
    projectThumbnail: false,
    incomeStatement: false,
    cashFlowStatement: false,
    balanceSheet: false,
    pitchingVideo: false,
    businessPlan: false,
    businessIdeaDocument: false,
  };
  private isClearingFields = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.projectForm = this.fb.group({
      // Personal Information
      name: ['', Validators.required],
      professionalStatus: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      linkedin: [''],

      // Project Information
      projectName: ['', Validators.required],
      category: ['', Validators.required],
      otherCategory: [''],
      location: ['', Validators.required],
      status: ['', Validators.required],
      prototypeLink: [''],
      employeesCount: [''],
      monthlyIncome: [''],
      websiteUrl: [''],
      speciality: ['', Validators.required],
      projectDescription: [
        '',
        [Validators.required, Validators.minLength(100)],
      ],
      purpose: ['', Validators.required],

      // File controls
      projectThumbnail: [null],
      incomeStatement: [null],
      cashFlowStatement: [null],
      balanceSheet: [null],
      pitchingVideo: [null],
      businessPlan: [null],
      businessIdeaDocument: [null],

      // Sponsorship
      hasSponsorship: ['', Validators.required],
      sponsorName: [''],
      needsSponsor: ['', Validators.required],
      orginSponsorship: [''],
      sellProject: [''],
      projectInvestment: [''],

      // Intellectual Property
      wantsIP: ['', Validators.required],
      needsBusinessPlan: [''],
      businessIdea: [''],

      // Confirmation Checkbox
      confirmationCheckbox: [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    if (this.projectId) {
      this.loadProject();
    } else {
      this.router.navigate(['/dashboard/project/my-projects']);
    }
    this.projectForm
      .get('category')
      ?.valueChanges.subscribe(() => this.clearHiddenFields());
    this.projectForm
      .get('status')
      ?.valueChanges.subscribe(() => this.clearHiddenFields());
    this.projectForm
      .get('hasSponsorship')
      ?.valueChanges.subscribe(() => this.clearHiddenFields());
    this.projectForm
      .get('needsSponsor')
      ?.valueChanges.subscribe(() => this.clearHiddenFields());
    this.projectForm
      .get('sellProject')
      ?.valueChanges.subscribe(() => this.clearHiddenFields());
    this.projectForm
      .get('wantsIP')
      ?.valueChanges.subscribe(() => this.clearHiddenFields());
  }

  async loadProject(): Promise<void> {
    if (!this.projectId) return;

    try {
      const project = await this.projectService.getProjectById(this.projectId);
      this.project = project;

      // Patch form values
      this.projectForm.patchValue({
        name: project.clientName,
        professionalStatus: project.professionalStatus,
        email: project.email,
        phone: project.phone,
        linkedin: project.linkedIn,
        projectName: project.projectName,
        category: project.category,
        location: project.projectLocation,
        status: project.projectStatus,
        prototypeLink: project.prototypeLink,
        employeesCount: project.numberOfEmp,
        monthlyIncome: project.monthlyIncome,
        websiteUrl: project.website,
        speciality: project.specialityOfProject,
        projectDescription: project.description,
        purpose: project.projectPurpose,
        hasSponsorship: project.haveSponsorQ
          ? project.haveSponsorQ.toLowerCase() === 'yes'
            ? 'Yes'
            : 'No'
          : '',
        sponsorName: project.sponsorName,
        needsSponsor: project.needSponsorQ
          ? project.needSponsorQ.toLowerCase() === 'yes'
            ? 'Yes'
            : 'No'
          : '',
        orginSponsorship: project.needOrgQ
          ? project.needOrgQ.toLowerCase() === 'yes'
            ? 'Yes'
            : 'No'
          : '',
        sellProject: project.doSellProjectQ
          ? project.doSellProjectQ.toLowerCase() === 'yes'
            ? 'Yes'
            : 'No'
          : '',
        projectInvestment: project.projectAmount,
        wantsIP: project.intellectualProjectQ
          ? project.intellectualProjectQ.toLowerCase() === 'yes'
            ? 'Yes'
            : 'No'
          : '',
        needsBusinessPlan: project.wantOriginToBusinessPlanQ
          ? project.wantOriginToBusinessPlanQ.toLowerCase() === 'yes'
            ? 'Yes'
            : 'No'
          : '',
        businessIdea: project.businessIdea,
      });

      // File fields: set value to URL or null
      if (project.projectPhotoUrl) {
        this.projectForm.get('projectThumbnail')?.setValue(project.projectPhotoUrl);
        this.fileReferences['projectThumbnail'] = null;
        this.fileChanged['projectThumbnail'] = false;
      } else {
        this.projectForm.get('projectThumbnail')?.setValue(null);
        this.fileReferences['projectThumbnail'] = null;
      }
      if (project.pitchingVideoUrl) {
        this.projectForm
          .get('pitchingVideo')
          ?.setValue(project.pitchingVideoUrl);
        this.fileReferences['pitchingVideo'] = null;
        this.fileChanged['pitchingVideo'] = false;
      } else {
        this.projectForm.get('pitchingVideo')?.setValue(null);
        this.fileReferences['pitchingVideo'] = null;
      }
      if (project.incomeStatementUrl) {
        this.projectForm
          .get('incomeStatement')
          ?.setValue(project.incomeStatementUrl);
        this.fileReferences['incomeStatement'] = null;
        this.fileChanged['incomeStatement'] = false;
      } else {
        this.projectForm.get('incomeStatement')?.setValue(null);
        this.fileReferences['incomeStatement'] = null;
      }
      if (project.cashFlowUrl) {
        this.projectForm
          .get('cashFlowStatement')
          ?.setValue(project.cashFlowUrl);
        this.fileReferences['cashFlowStatement'] = null;
        this.fileChanged['cashFlowStatement'] = false;
      } else {
        this.projectForm.get('cashFlowStatement')?.setValue(null);
        this.fileReferences['cashFlowStatement'] = null;
      }
      if (project.balanceSheetUrl) {
        this.projectForm.get('balanceSheet')?.setValue(project.balanceSheetUrl);
        this.fileReferences['balanceSheet'] = null;
        this.fileChanged['balanceSheet'] = false;
      } else {
        this.projectForm.get('balanceSheet')?.setValue(null);
        this.fileReferences['balanceSheet'] = null;
      }
      if (project.businessPlanUrl) {
        this.projectForm.get('businessPlan')?.setValue(project.businessPlanUrl);
        this.fileReferences['businessPlan'] = null;
        this.fileChanged['businessPlan'] = false;
      } else {
        this.projectForm.get('businessPlan')?.setValue(null);
        this.fileReferences['businessPlan'] = null;
      }
      if (project.businessIdeaDocumentUrl) {
        this.projectForm
          .get('businessIdeaDocument')
          ?.setValue(project.businessIdeaDocumentUrl);
        this.fileReferences['businessIdeaDocument'] = null;
        this.fileChanged['businessIdeaDocument'] = false;
      } else {
        this.projectForm.get('businessIdeaDocument')?.setValue(null);
        this.fileReferences['businessIdeaDocument'] = null;
      }
    } catch (error) {
      console.error('Error loading project:', error);
      // Handle error appropriately
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
        fileInput.value = '';
        return;
      }

      this.fileReferences[controlName] = file;
      this.fileChanged[controlName] = true;
      this.projectForm.get(controlName)?.setValue(file);
    } else {
      delete this.fileReferences[controlName];
      this.fileChanged[controlName] = false;
      this.projectForm.get(controlName)?.setValue(null);
    }
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.updateValidationForCurrentStep();
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateValidationForCurrentStep();
    }
  }

  goToStep(index: number) {
    if (index >= 0 && index < this.steps.length) {
      this.currentStep = index;
      this.updateValidationForCurrentStep();
    }
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
              Validators.minLength(100),
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

  async onSubmit(): Promise<void> {
    if (!this.projectId) {
      return;
    }

    this.isSubmitting = true;

    try {
      const formData = this.projectForm.value;

      // Map form data to match backend expectations
      const projectData = {
        clientName: formData.name,
        professionalStatus: formData.professionalStatus,
        email: formData.email,
        phone: formData.phone,
        linkedIn: formData.linkedin,
        projectName: formData.projectName,
        category:
          formData.category === 'Other'
            ? formData.otherCategory
            : formData.category,
        projectLocation: formData.location,
        projectStatus: formData.status,
        prototypeLink: formData.prototypeLink,
        numberOfEmp: formData.employeesCount,
        monthlyIncome: formData.monthlyIncome,
        website: formData.websiteUrl,
        specialityOfProject: formData.speciality,
        description: formData.projectDescription,
        projectPurpose: formData.purpose,
        haveSponsorQ: formData.hasSponsorship?.toLowerCase(),
        sponsorName: formData.sponsorName,
        needSponsorQ: formData.needsSponsor?.toLowerCase(),
        doSellProjectQ: formData.sellProject?.toLowerCase(),
        projectAmount: formData.projectInvestment,
        intellectualProjectQ: formData.wantsIP?.toLowerCase(),
        wantOriginToBusinessPlanQ: formData.needsBusinessPlan?.toLowerCase(),
        businessIdea: formData.businessIdea,
      };

      await this.projectService.updateProject(
        this.projectId,
        projectData,
        this.fileReferences,
        this.projectForm.value
      );

      // Navigate back to projects list with success parameter
      this.router.navigate(['/dashboard/project/my-projects'], {
        queryParams: { updated: true },
      });
    } catch (error: any) {
      console.error('Error updating project:', error);
      if (error.status === 401) {
        alert('Please upgrade your plan to update the project.');
      } else if (error.status === 409) {
        alert('A project with this name already exists.');
      } else {
        alert(
          error.error ||
            'An error occurred while updating your project. Please try again.'
        );
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  getStepFields(step: number): string[] {
    switch (step) {
      case 0: // Personal Information
        return ['name', 'professionalStatus', 'email', 'phone', 'linkedin'];
      case 1: // Project Information
        return [
          'projectName',
          'category',
          'otherCategory',
          'location',
          'status',
          'prototypeLink',
          'employeesCount',
          'monthlyIncome',
          'websiteUrl',
          'speciality',
          'projectDescription',
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
          'incomeStatement',
          'cashFlowStatement',
          'balanceSheet',
          'pitchingVideo',
        ];
      case 4: // Review
        return ['confirmationCheckbox'];
      default:
        return [];
    }
  }

  getFormData(): { label: string; value: any }[] {
    const categoryValue =
      this.projectForm.get('category')?.value === 'Other'
        ? this.projectForm.get('otherCategory')?.value
        : this.projectForm.get('category')?.value;

    const getFileDisplay = (controlName: string) => {
      const value = this.projectForm.get(controlName)?.value;
      if (this.fileReferences[controlName]?.name) {
        return this.fileReferences[controlName].name;
      }
      if (typeof value === 'string' && value) {
        // For all files, return "File uploaded" if it's a URL or has a value
        return 'File uploaded';
      }
      return 'Not provided';
    };

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
        value: this.projectForm.get('projectDescription')?.value,
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
        label: 'projectLaunch.fields.speciality',
        value: this.projectForm.get('speciality')?.value || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.purpose',
        value: this.projectForm.get('purpose')?.value || 'Not provided',
      },
      {
        label: 'projectLaunch.fields.projectThumbnail',
        value: getFileDisplay('projectThumbnail'),
      },
      {
        label: 'projectLaunch.fields.incomeStatement',
        value: getFileDisplay('incomeStatement'),
      },
      {
        label: 'projectLaunch.fields.cashFlowStatement',
        value: getFileDisplay('cashFlowStatement'),
      },
      {
        label: 'projectLaunch.fields.balanceSheet',
        value: getFileDisplay('balanceSheet'),
      },
      {
        label: 'projectLaunch.fields.pitchingVideo',
        value: getFileDisplay('pitchingVideo'),
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
        value: getFileDisplay('businessPlan'),
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
        value: getFileDisplay('businessIdeaDocument'),
      },
    ];
  }

  onClear() {
    const stepFields = this.getStepFields(this.currentStep);
    stepFields.forEach((field) => {
      const control = this.projectForm.get(field);
      if (control) {
        control.reset();
        // Also clear file reference if it's a file field
        if (this.fileReferences.hasOwnProperty(field)) {
          this.fileReferences[field] = null;
        }
      }
    });
  }

  getFileName(controlName: string): string {
    const value = this.projectForm.get(controlName)?.value;
    if (this.fileReferences[controlName]?.name) {
      return this.fileReferences[controlName].name;
    }
    if (typeof value === 'string' && value) {
      try {
        return decodeURIComponent(value.split('/').pop() || 'File uploaded');
      } catch {
        return 'File uploaded';
      }
    }
    return '';
  }

  removeFile(controlName: string): void {
    this.projectForm.get(controlName)?.setValue(null);
    this.fileReferences[controlName] = null;
    this.fileChanged[controlName] = false;
  }

  clearHiddenFields() {
    // Skip clearing fields if the project status is DECLINED
    if (this.project && this.project.status === 'DECLINED') {
      return;
    }

    // Prevent infinite recursion
    if (this.isClearingFields) {
      return;
    }
    this.isClearingFields = true;

    try {
      // Category: clear otherCategory if not 'Other'
      if (this.projectForm.get('category')?.value !== 'Other') {
        this.projectForm.get('otherCategory')?.setValue('');
      }
      // Status: clear prototypeLink, employeesCount, monthlyIncome, websiteUrl, incomeStatement, cashFlowStatement, balanceSheet if not 'Prototype' or 'Operating'
      if (this.projectForm.get('status')?.value !== 'Prototype') {
        this.projectForm.get('prototypeLink')?.setValue('');
      }
      if (this.projectForm.get('status')?.value !== 'Operating') {
        [
          'employeesCount',
          'monthlyIncome',
          'websiteUrl',
          'incomeStatement',
          'cashFlowStatement',
          'balanceSheet',
        ].forEach((f) => {
          this.projectForm.get(f)?.setValue('');
          if (this.fileReferences[f] !== undefined) this.fileReferences[f] = null;
        });
      }
      // Sponsorship: clear sponsorName if not Yes, needsSponsor/orginSponsorship if not No/Yes, projectInvestment if not Yes
      if (this.projectForm.get('hasSponsorship')?.value !== 'Yes') {
        this.projectForm.get('sponsorName')?.setValue('');
      }
      if (this.projectForm.get('hasSponsorship')?.value !== 'No') {
        this.projectForm.get('needsSponsor')?.setValue('');
      }
      if (this.projectForm.get('needsSponsor')?.value !== 'Yes') {
        this.projectForm.get('orginSponsorship')?.setValue('');
      }
      if (this.projectForm.get('sellProject')?.value !== 'Yes') {
        this.projectForm.get('projectInvestment')?.setValue('');
      }
      // IP: clear businessPlan, needsBusinessPlan, businessIdea, businessIdeaDocument if not Yes
      if (this.projectForm.get('wantsIP')?.value !== 'Yes') {
        [
          'businessPlan',
          'needsBusinessPlan',
          'businessIdea',
          'businessIdeaDocument',
        ].forEach((f) => {
          this.projectForm.get(f)?.setValue('');
          if (this.fileReferences[f] !== undefined) this.fileReferences[f] = null;
        });
      }
    } finally {
      this.isClearingFields = false;
    }
  }
}
