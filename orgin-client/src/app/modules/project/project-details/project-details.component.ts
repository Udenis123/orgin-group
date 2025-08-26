import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl, FormsModule } from '@angular/forms';
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
  team: Array<{ title: string; number: number; wageType: string; wage: string }>;
  userId: string;
}

type ProjectType = 'launched' | 'ordered' | 'community';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    FormsModule
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

  // Loading state for delete team member
  deletingTeamMemberIndex: number | null = null;

  // Loading state for update team member
  updatingTeamMemberIndex: number | null = null;

  // Loading state for modal update
  isUpdatingTeamMember = false;

  // Loading state for submitting new team members
  isSubmittingTeamMembers = false;

  // Edit mode for team members
  editingTeamMemberIndex: number | null = null;

  // Popup modal for team member updates
  showUpdateTeamMemberModal = false;
  updatingTeamMember: { title: string; number: number; wageType: string; wage: string } | null = null;

  // Loading states for query actions
  isUpdating = false;
  isResubmitting = false;

  // Wage types for team members
  wageTypes = ['Free', 'Shares', 'Wages'];

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
      // Silently continue to next project type
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
      // Silently continue to next project type
    }

    // Finally try community project
    try {
      const communityProject = await this.projectService.getCommunityProjectById(projectId);
      this.project = communityProject;
      this.projectType = 'community';
      return;
    } catch (error) {
      // Silently continue
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
  getTeamMembers(): Array<{ title: string; number: number; wageType: string; wage: string }> {
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
  async addTeamMember(projectId: string, teamMember: { title: string; number: number; wageType: string; wage: string }): Promise<void> {
    try {
      await this.projectService.addTeamMemberToCommunityProject(projectId, teamMember);
      // Refresh the project data to show the new team member
      await this.loadProjectDetails();
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  }

  // Delete team member from community project
  async deleteTeamMember(projectId: string, index: number): Promise<void> {
    this.deletingTeamMemberIndex = index;
    try {
      await this.projectService.deleteTeamMember(projectId, index);
      
      // Update the local team array instead of reloading the entire project
      if (this.isCommunityProject() && this.project) {
        const communityProject = this.project as CommunityProject;
        if (communityProject.team && communityProject.team.length > index) {
          communityProject.team.splice(index, 1);
        }
      }
      
      console.log('Team member deleted successfully');
    } catch (error) {
      console.error('Error deleting team member:', error);
      // If local update fails, reload the project data
      await this.loadProjectDetails();
    } finally {
      this.deletingTeamMemberIndex = null;
    }
  }

  // Update team member in community project
  async updateTeamMember(projectId: string, index: number, teamMember: { title: string; number: number; wageType: string; wage: string }): Promise<void> {
    this.updatingTeamMemberIndex = index;
    try {
      await this.projectService.updateTeamMember(projectId, index, teamMember);
      
      // Update the local team array instead of reloading the entire project
      if (this.isCommunityProject() && this.project) {
        const communityProject = this.project as CommunityProject;
        if (communityProject.team && communityProject.team.length > index) {
          communityProject.team[index] = teamMember;
        }
      }
      
      // Exit edit mode
      this.editingTeamMemberIndex = null;
      console.log('Team member updated successfully');
    } catch (error) {
      console.error('Error updating team member:', error);
      // If local update fails, reload the project data
      await this.loadProjectDetails();
    } finally {
      this.updatingTeamMemberIndex = null;
    }
  }

  // Start editing a team member (now opens popup)
  startEditTeamMember(index: number): void {
    const teamMembers = this.getTeamMembers();
    if (teamMembers[index]) {
      this.updatingTeamMember = { ...teamMembers[index] };
      this.updatingTeamMemberIndex = index; // Store the original index
      this.showUpdateTeamMemberModal = true;
    }
  }

  // Cancel editing a team member
  cancelEditTeamMember(): void {
    this.editingTeamMemberIndex = null;
  }

  // Close update team member modal
  closeUpdateTeamMemberModal(): void {
    this.showUpdateTeamMemberModal = false;
    this.updatingTeamMember = null;
    this.updatingTeamMemberIndex = null;
  }

  // Handle wage type change in update modal
  onUpdateModalWageTypeChange(): void {
    if (this.updatingTeamMember && this.updatingTeamMember.wageType === 'Free') {
      this.updatingTeamMember.wage = '0';
    }
  }

  // Update team member from modal
  async updateTeamMemberFromModal(): Promise<void> {
    if (this.updatingTeamMember) {
      this.isUpdatingTeamMember = true;
      try {
        const projectId = this.getCommunityProjectId();
        // Find the index of the team member being updated
        const teamMembers = this.getTeamMembers();
        const index = teamMembers.findIndex(member => 
          member.title === this.updatingTeamMember?.title && 
          member.number === this.updatingTeamMember?.number &&
          member.wageType === this.updatingTeamMember?.wageType &&
          member.wage === this.updatingTeamMember?.wage
        );
        
        if (index !== -1) {
          this.updatingTeamMemberIndex = index;
          await this.updateTeamMember(projectId, index, this.updatingTeamMember);
          this.closeUpdateTeamMemberModal();
        } else {
          // If we can't find the exact match, use the original index
          // This happens when the user modifies the data
          const originalIndex = this.updatingTeamMemberIndex;
          if (originalIndex !== null) {
            await this.updateTeamMember(projectId, originalIndex, this.updatingTeamMember);
            this.closeUpdateTeamMemberModal();
          }
        }
      } catch (error) {
        console.error('Error updating team member:', error);
        this.updatingTeamMemberIndex = null; // Reset on error
      } finally {
        this.isUpdatingTeamMember = false;
      }
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
      number: [1, [Validators.required, Validators.min(1)]],
      wageType: ['Free', Validators.required],
      wage: ['0', [Validators.required, Validators.min(0)]]
    });
    this.newTeamMembers.push(teamMember);
    
    // Set up wage type change listener for the new row
    const index = this.newTeamMembers.length - 1;
    this.setupWageTypeChangeListener(index);
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
    } else {
      // Set up listeners for existing rows
      for (let i = 0; i < this.newTeamMembers.length; i++) {
        this.setupWageTypeChangeListener(i);
      }
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
      this.isSubmittingTeamMembers = true;
      try {
        const projectId = this.getCommunityProjectId();
        
        // Add each team member
        for (let i = 0; i < this.newTeamMembers.length; i++) {
          const memberGroup = this.newTeamMembers.at(i) as FormGroup;
          const teamMember = {
            title: memberGroup.value.title,
            number: parseInt(memberGroup.value.number),
            wageType: memberGroup.value.wageType,
            wage: memberGroup.value.wage
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
      } finally {
        this.isSubmittingTeamMembers = false;
      }
    }
  }

  // Handle wage type change for a specific team member
  onWageTypeChange(index: number) {
    const teamMember = this.newTeamMembers.at(index) as FormGroup;
    const wageTypeControl = teamMember.get('wageType');
    const wageControl = teamMember.get('wage');
    
    if (wageTypeControl?.value === 'Free') {
      wageControl?.setValue('0');
    } else {
      if (wageTypeControl?.value === 'Shares') {
        wageControl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      } else if (wageTypeControl?.value === 'Wages') {
        wageControl?.setValidators([Validators.required, Validators.min(0)]);
      }
      wageControl?.updateValueAndValidity();
    }
  }

  // Handle wage type change for editing existing team members
  onEditWageTypeChange(index: number) {
    const teamMembers = this.getTeamMembers();
    if (teamMembers[index]) {
      if (teamMembers[index].wageType === 'Free') {
        teamMembers[index].wage = '0';
      }
    }
  }

  // Set up wage type change listener for a specific team member
  setupWageTypeChangeListener(index: number) {
    const teamMember = this.newTeamMembers.at(index) as FormGroup;
    const wageTypeControl = teamMember.get('wageType');
    
    wageTypeControl?.valueChanges.subscribe(() => {
      this.onWageTypeChange(index);
    });
  }

  // Get wage placeholder based on wage type
  getWagePlaceholder(wageType: string): string {
    switch (wageType) {
      case 'Shares':
        return 'Enter percentage (0-100)';
      case 'Wages':
        return 'Enter amount in Rwandan Franc';
      default:
        return '0';
    }
  }

  // Get wage label based on wage type
  getWageLabel(wageType: string): string {
    switch (wageType) {
      case 'Shares':
        return 'Percentage (%)';
      case 'Wages':
        return 'Amount (RWF)';
      default:
        return 'Wage';
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

  // Handle project update for QUERY status
  updateProject(): void {
    this.isUpdating = true;
    
    // Route to the appropriate update page based on project type
    if (this.isCommunityProject()) {
      this.router.navigate([`/dashboard/project/update/community/${this.route.snapshot.paramMap.get('id')}`]);
    } else if (this.isLaunchedProject()) {
      this.router.navigate([`/dashboard/project/update/launched/${this.route.snapshot.paramMap.get('id')}`]);
    } else if (this.isOrderedProject()) {
      this.router.navigate([`/dashboard/project/update/ordered/${this.route.snapshot.paramMap.get('id')}`]);
    }
    
    this.isUpdating = false;
  }

  // Handle project resubmission for QUERY status
  async resubmitProject(): Promise<void> {
    this.isResubmitting = true;
    
    try {
      const projectId = this.route.snapshot.paramMap.get('id');
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      // Call the appropriate resubmit method based on project type
      if (this.isCommunityProject()) {
        await this.projectService.resubmitCommunityProject(projectId);
      } else if (this.isLaunchedProject()) {
        await this.projectService.resubmitLaunchedProject(projectId);
      } else if (this.isOrderedProject()) {
        await this.projectService.resubmitOrderedProject(projectId);
      }

      // Reload project details to show updated status
      await this.loadProjectDetails();
      
      console.log('Project resubmitted successfully');
    } catch (error) {
      console.error('Error resubmitting project:', error);
      // You might want to show a toast notification here
    } finally {
      this.isResubmitting = false;
    }
  }

  // Format number with commas by counting 3 digits from behind
  formatNumberWithCommas(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '0';
    }
    
    // Convert to string and remove any existing commas
    const stringValue = value.toString().replace(/,/g, '');
    
    // Check if it's a valid number
    if (isNaN(Number(stringValue))) {
      return '0';
    }
    
    // Split by decimal point if exists
    const parts = stringValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] || '';
    
    // Add commas to integer part by counting 3 digits from behind
    let formattedInteger = '';
    for (let i = integerPart.length - 1, count = 0; i >= 0; i--, count++) {
      if (count > 0 && count % 3 === 0) {
        formattedInteger = ',' + formattedInteger;
      }
      formattedInteger = integerPart[i] + formattedInteger;
    }
    
    // Combine with decimal part if exists
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  }
}
