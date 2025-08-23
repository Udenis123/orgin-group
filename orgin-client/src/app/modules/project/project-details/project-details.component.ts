import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
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

interface CommunityProject {
  id: string;
  fullName: string;
  profession: string;
  email: string;
  phone: string;
  linkedIn: string;
  projectPhoto: string;
  projectName: string;
  category: string;
  location: string;
  description: string;
  status: string;
  reason: string;
  createdAt: string;
  updatedOn: string;
  team: Array<{ title: string; number: number }>;
  userId: string;
}

type ProjectType = 'launched' | 'ordered' | 'community';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})
export class ProjectDetailsComponent implements OnInit {
  project: Project | OrderedProject | CommunityProject | undefined;
  projectType: ProjectType = 'launched';
  projectAnalytics?: ProjectAnalytics;
  error: string | null = null;
  isLoading = false;
  @ViewChild('videoPreview') videoPreview: any;
  @ViewChild('videoPreviewModal') videoPreviewModal: any;
  currentVideoUrl: string = '';
  addTeamMemberForm: FormGroup;
  showAddTeamMemberForm = false;

  // Popup properties for truncation
  showPopup = false;
  popupContent = '';
  popupTitle = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public translate: TranslateService,
    private modalService: NgbModal,
    private projectService: ProjectService,
    private fb: FormBuilder
  ) {
    this.addTeamMemberForm = this.fb.group({
      newTeamMembers: this.fb.array([])
    });
  }

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

    // Finally try community project
    try {
      const communityProject = await this.projectService.getCommunityProjectById(projectId);
      this.project = communityProject;
      this.projectType = 'community';
      return;
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
    if (this.isCommunityProject()) {
      return (this.project as CommunityProject).projectName || '';
    }
    return (this.project as Project).projectName || '';
  }

  getProjectDescription(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).projectDescription || '';
    }
    if (this.isCommunityProject()) {
      return (this.project as CommunityProject).description || '';
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
    if (this.isCommunityProject()) {
      return (this.project as CommunityProject).fullName || '';
    }
    return (this.project as Project).clientName || '';
  }

  getEmail(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).email || '';
    }
    if (this.isCommunityProject()) {
      return (this.project as CommunityProject).email || '';
    }
    return (this.project as Project).email || '';
  }

  getPhone(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).phone || '';
    }
    if (this.isCommunityProject()) {
      return (this.project as CommunityProject).phone || '';
    }
    return (this.project as Project).phone || '';
  }

  getLinkedIn(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).linkedIn || '';
    }
    if (this.isCommunityProject()) {
      return (this.project as CommunityProject).linkedIn || '';
    }
    return (this.project as Project).linkedIn || '';
  }

  getProjectLocation(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).projectLocation;
    }
    if (this.isCommunityProject()) {
      return (this.project as CommunityProject).location || '';
    }
    return (this.project as Project).projectLocation || '';
  }

  getSpeciality(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).specialityOfProject;
    }
    if (this.isCommunityProject()) {
      return (this.project as CommunityProject).profession || '';
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
    if (this.isCommunityProject()) {
      return (this.project as CommunityProject).reason || '';
    }
    return (this.project as Project).feedback || '';
  }

  // Ordered project specific helper methods
  getProfessionalStatus(): string {
    if (this.isOrderedProject()) {
      return (this.project as OrderedProject).professionalStatus || '';
    }
    if (this.isCommunityProject()) {
      return (this.project as CommunityProject).profession || '';
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
    if (this.isCommunityProject()) {
      return (this.project as CommunityProject).createdAt || '';
    }
    return '';
  }

  getUpdatedOn(): string {
    if (this.isLaunchedProject()) {
      return (this.project as Project).updatedOn || '';
    }
    if (this.isCommunityProject()) {
      return (this.project as CommunityProject).updatedOn || '';
    }
    return '';
  }

  // Additional launched project specific helper methods
  getCategory(): string {
    if (this.isLaunchedProject()) {
      return (this.project as Project).category || '';
    }
    if (this.isCommunityProject()) {
      return (this.project as CommunityProject).category || '';
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
    if (this.isCommunityProject()) {
      return (this.project as CommunityProject).projectPhoto || '';
    }
    return '';
  }

  // Community project specific helper methods
  getTeamMembers(): Array<{ title: string; number: number }> {
    if (this.isCommunityProject()) {
      return (this.project as CommunityProject).team || [];
    }
    return [];
  }

  hasTeamMembers(): boolean {
    if (this.isCommunityProject()) {
      const team = (this.project as CommunityProject).team;
      return team && team.length > 0;
    }
    return false;
  }

  // Add new team member to community project
  async addTeamMember(projectId: string, teamMember: { title: string; number: number }): Promise<void> {
    try {
      await this.projectService.addTeamMemberToCommunityProject(projectId, teamMember);
      // Refresh the project data to show the new team member
      await this.loadProjectDetails();
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  }

  // Get project ID for community projects
  getCommunityProjectId(): string {
    if (this.isCommunityProject()) {
      return (this.project as CommunityProject).id;
    }
    return '';
  }

  // Form Array getter
  get newTeamMembers() {
    return this.addTeamMemberForm.get('newTeamMembers') as FormArray;
  }

  // Add a new team member row
  addTeamMemberRow() {
    const teamMember = this.fb.group({
      title: ['', Validators.required],
      number: [1, [Validators.required, Validators.min(1)]]
    });
    this.newTeamMembers.push(teamMember);
  }

  // Remove a team member row
  removeTeamMemberRow(index: number) {
    this.newTeamMembers.removeAt(index);
  }

  // Get form controls for a specific team member
  getTeamMemberControls(index: number) {
    return this.newTeamMembers.at(index) as FormGroup;
  }

  // Show the add team member form
  showAddTeamMemberFormSection() {
    this.showAddTeamMemberForm = true;
    // Add at least one row when showing the form
    if (this.newTeamMembers.length === 0) {
      this.addTeamMemberRow();
    }
  }

  // Hide the add team member form
  hideAddTeamMemberForm() {
    this.showAddTeamMemberForm = false;
    this.addTeamMemberForm.reset();
    // Clear the form array
    while (this.newTeamMembers.length !== 0) {
      this.newTeamMembers.removeAt(0);
    }
  }

  // Save all new team members
  async saveTeamMembers(): Promise<void> {
    if (this.addTeamMemberForm.valid && this.newTeamMembers.length > 0) {
      try {
        const projectId = this.getCommunityProjectId();
        
        // Add each team member
        for (let i = 0; i < this.newTeamMembers.length; i++) {
          const memberGroup = this.newTeamMembers.at(i) as FormGroup;
          const teamMember = {
            title: memberGroup.value.title,
            number: parseInt(memberGroup.value.number)
          };
          
          await this.addTeamMember(projectId, teamMember);
        }
        
        // Hide form and reset
        this.hideAddTeamMemberForm();
        
        // Show success message
        console.log('Team members added successfully');
      } catch (error) {
        console.error('Error adding team members:', error);
        // Show error message
      }
    }
  }

  // Clear the form
  clearTeamMemberForm() {
    this.addTeamMemberForm.reset();
    // Clear the form array
    while (this.newTeamMembers.length !== 0) {
      this.newTeamMembers.removeAt(0);
    }
    // Add one empty row
    this.addTeamMemberRow();
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

  // Text truncation and popup methods
  truncateText(text: string, maxLength: number = 50): string {
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }

  shouldShowViewMore(text: string, maxLength: number = 50): boolean {
    return !!(text && text.length > maxLength);
  }

  showFullText(content: string, title: string): void {
    this.popupContent = content;
    this.popupTitle = title;
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
    this.popupContent = '';
    this.popupTitle = '';
  }
}
