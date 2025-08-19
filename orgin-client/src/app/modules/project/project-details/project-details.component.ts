import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from '../../../services/project.services';
import { Project } from '../project.module';

interface ProjectAnalytics {
  views: number;
  interactions: number;
  interestedInvestors: number;
  feasibility: {
    percentage: number;
    reason: string;
  };
  income: {
    roi: number;
  };
}

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

type ProjectType = 'launched' | 'ordered' | 'community';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})
export class ProjectDetailsComponent implements OnInit {
  project: Project | OrderedProject | undefined;
  projectType: ProjectType = 'launched';
  projectAnalytics?: ProjectAnalytics;
  error: string | null = null;
  isLoading = false;
  @ViewChild('videoPreview') videoPreview: any;
  @ViewChild('videoPreviewModal') videoPreviewModal: any;
  currentVideoUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public translate: TranslateService,
    private modalService: NgbModal,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadProjectDetails();
  }

  private async loadProjectDetails() {
    this.isLoading = true;
    this.error = null;

    try {
      const projectId = this.route.snapshot.paramMap.get('id');
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      // Try to determine project type from URL or try different endpoints
      await this.tryLoadProject(projectId);
      
    } catch (error) {
      console.error('Error loading project details:', error);
      this.error = error instanceof Error ? error.message : 'An error occurred while loading the project';
    } finally {
      this.isLoading = false;
    }
  }

  private async tryLoadProject(projectId: string) {
    // First try to load as ordered project
    try {
      const orderedProject = await this.projectService.getOrderedProjectById(projectId);
      this.project = orderedProject;
      this.projectType = 'ordered';
      return;
    } catch (error) {
      console.log('Not an ordered project, trying launched project...');
    }

    // Then try to load as launched project
    try {
      const launchedProject = await this.projectService.getProjectById(projectId);
      this.project = launchedProject;
      this.projectType = 'launched';
      
      // Load analytics for approved launched projects
      if (this.project.status === 'APPROVED') {
        try {
          this.projectAnalytics = await this.projectService.getProjectAnalytics(projectId);
        } catch (error) {
          console.error('Error loading project analytics:', error);
          // Don't set error state here as it's not critical
        }
      }
      return;
    } catch (error) {
      console.log('Not a launched project, trying community project...');
    }

    // Finally try community project (if endpoint exists)
    try {
      // TODO: Implement community project loading when endpoint is available
      // const communityProject = await this.projectService.getCommunityProjectById(projectId);
      // this.project = communityProject;
      // this.projectType = 'community';
      // return;
    } catch (error) {
      console.log('Not a community project...');
    }

    // If we get here, no project type matched
    throw new Error('Project not found or not accessible');
  }

  goBack() {
    this.router.navigate(['dashboard/project/my-projects']);
  }

  // Helper methods to check project type
  isOrderedProject(): boolean {
    return this.projectType === 'ordered';
  }

  isLaunchedProject(): boolean {
    return this.projectType === 'launched';
  }

  isCommunityProject(): boolean {
    return this.projectType === 'community';
  }

  // Helper methods to safely access project properties
  getProjectName(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).projectTitle || '';
    }
    return (this.project as Project).projectName || '';
  }

  getProjectDescription(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).projectDescription || '';
    }
    return (this.project as Project).description || '';
  }

  getProjectStatus(): string {
    return this.project?.status || '';
  }

  getClientName(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).clientName || '';
    }
    return (this.project as Project).clientName || '';
  }

  getEmail(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).email || '';
    }
    return (this.project as Project).email || '';
  }

  getPhone(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).phone || '';
    }
    return (this.project as Project).phone || '';
  }

  getLinkedIn(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).linkedIn || '';
    }
    return (this.project as Project).linkedIn || '';
  }

  getProjectLocation(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).projectLocation;
    }
    return (this.project as Project).projectLocation || '';
  }

  getSpeciality(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).specialityOfProject;
    }
    return (this.project as Project).specialityOfProject || '';
  }

  getBusinessIdea(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).businessIdea || '';
    }
    return (this.project as Project).businessIdea || '';
  }

  getSponsorName(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).sponsorName || '';
    }
    return (this.project as Project).sponsorName || '';
  }

  getHasSponsorship(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).doYouHaveSponsorship;
    }
    return (this.project as Project).haveSponsorQ || '';
  }

  getNeedsBusinessPlan(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).doYouNeedBusinessPlan;
    }
    return (this.project as Project).wantOriginToBusinessPlanQ || '';
  }

  getWantsIP(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).doYouNeedIntellectualProject;
    }
    return (this.project as Project).intellectualProjectQ || '';
  }

  getReasons(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).reasons || '';
    }
    return (this.project as Project).feedback || '';
  }

  // Ordered project specific helper methods
  getProfessionalStatus(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).professionalStatus || '';
    }
    return '';
  }

  getCompanyName(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).companyName || '';
    }
    return '';
  }

  getProjectType(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).projectType || '';
    }
    return '';
  }

  getTargetAudience(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).targetAudience || '';
    }
    return '';
  }

  getReferences(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).references || '';
    }
    return '';
  }

  // Launched project specific helper methods
  getSubmittedOn(): string {
    if (this.isLaunchedProject()) {
      return (this.project as Project).submittedOn || '';
    }
    return '';
  }

  getUpdatedOn(): string {
    if (this.isLaunchedProject()) {
      return (this.project as Project).updatedOn || '';
    }
    return '';
  }

  // Additional launched project specific helper methods
  getCategory(): string {
    if (this.isLaunchedProject()) {
      return (this.project as Project).category || '';
    }
    return '';
  }

  getProjectStatusField(): string {
    if (this.isLaunchedProject()) {
      return (this.project as Project).projectStatus || '';
    }
    return '';
  }

  getPrototypeLink(): string {
    if (this.isLaunchedProject()) {
      return (this.project as Project).prototypeLink || '';
    }
    return '';
  }

  getNumberOfEmp(): number | null {
    if (this.isLaunchedProject()) {
      return (this.project as Project).numberOfEmp || null;
    }
    return null;
  }

  getMonthlyIncome(): number | null {
    if (this.isLaunchedProject()) {
      return (this.project as Project).monthlyIncome || null;
    }
    return null;
  }

  getWebsite(): string {
    if (this.isLaunchedProject()) {
      return (this.project as Project).website || '';
    }
    return '';
  }

  getNeedSponsorQ(): string {
    if (this.isLaunchedProject()) {
      return (this.project as Project).needSponsorQ || '';
    }
    return '';
  }

  getNeedOrgQ(): string {
    if (this.isLaunchedProject()) {
      return (this.project as Project).needOrgQ || '';
    }
    return '';
  }

  getDoSellProjectQ(): string {
    if (this.isLaunchedProject()) {
      return (this.project as Project).doSellProjectQ || '';
    }
    return '';
  }

  getProjectAmount(): number | null {
    if (this.isLaunchedProject()) {
      return (this.project as Project).projectAmount || null;
    }
    return null;
  }

  // Document URLs for ordered projects
  getBusinessIdeaDocumentUrl(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).businessIdeaDocumentUrl || '';
    }
    return (this.project as Project).businessIdeaDocumentUrl || '';
  }

  getBusinessPlanUrl(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).businessPlanUrl || '';
    }
    return (this.project as Project).businessPlanUrl || '';
  }

  // Document URLs for launched projects
  getIncomeStatementUrl(): string {
    if (this.isLaunchedProject()) {
      return (this.project as Project).incomeStatementUrl || '';
    }
    return '';
  }

  getCashFlowUrl(): string {
    if (this.isLaunchedProject()) {
      return (this.project as Project).cashFlowUrl || '';
    }
    return '';
  }

  getBalanceSheetUrl(): string {
    if (this.isLaunchedProject()) {
      return (this.project as Project).balanceSheetUrl || '';
    }
    return '';
  }

  getPitchingVideoUrl(): string {
    if (this.isLaunchedProject()) {
      return (this.project as Project).pitchingVideoUrl || '';
    }
    return '';
  }

  getProjectPhotoUrl(): string {
    if (this.isLaunchedProject()) {
      return (this.project as Project).projectPhotoUrl || '';
    }
    return '';
  }

  hasBasicInfo(): boolean {
    return !!this.getEmail() || !!this.getPhone() || !!this.getLinkedIn();
  }

  hasProjectInfo(): boolean {
    return !!this.getProjectLocation() || !!this.getSpeciality();
  }

  previewVideo(videoUrl: string) {
    this.currentVideoUrl = videoUrl;
    const modalRef = this.modalService.open(this.videoPreviewModal, { size: 'lg' });

    modalRef.shown.subscribe(() => {
      this.videoPreview.nativeElement.play();
    });

    modalRef.hidden.subscribe(() => {
      this.videoPreview.nativeElement.pause();
      this.videoPreview.nativeElement.currentTime = 0;
    });
  }

  downloadDocument(url: string) {
    if (url) {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = url;
      // Get filename from URL
      const filename = decodeURIComponent(url.split('/').pop() || 'download');
      link.download = filename;
      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  get previewText(): string {
    return this.translate.instant('projectDetails.buttons.preview');
  }

  get downloadText(): string {
    return this.translate.instant('projectDetails.buttons.download');
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }
}
