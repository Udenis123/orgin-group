import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProjectService } from '../../../services/project.services';
import { Project } from '../project.module';

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
  status: string;
  reasons?: string;
}

interface JoinedProject {
  projectId: string;
  userId: string;
  projectName: string;
  description: string;
  projectOwner: string;
  ownerEmail: string;
  joinedDate: string;
  status: string;
  projectType: string;
  location: string;
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

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.scss'],
})
export class MyProjectsComponent implements OnInit {
  launchedProjects: Project[] = [];
  orderedProjects: any[] = [];
  joinedProjects: any[] = [];
  communityProjects: Project[] = [];
  isLoading = false;
  error: string | null = null;

  // Math object for template usage
  Math = Math;

  // Popup properties
  showPopup = false;
  popupContent = '';
  popupTitle = '';

  // Loading states for delete operations
  deletingProjectId: string | null = null;

  // Custom delete confirmation modal properties
  showDeleteModal = false;
  projectToDelete: Project | any = null;
  deleteModalTitle = '';
  deleteModalMessage = '';

  // Pagination properties for each section
  launchedProjectsPage = 1;
  launchedProjectsPageSize = 5;
  launchedProjectsTotal = 0;

  orderedProjectsPage = 1;
  orderedProjectsPageSize = 5;
  orderedProjectsTotal = 0;

  joinedProjectsPage = 1;
  joinedProjectsPageSize = 5;
  joinedProjectsTotal = 0;

  communityProjectsPage = 1;
  communityProjectsPageSize = 5;
  communityProjectsTotal = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    // Check for query params that might indicate a successful update
    this.route.queryParams.subscribe((params) => {
      if (params['updated']) {
        // Handle successful update (e.g., show a success message)
        // You might want to implement a toast/notification service for this
      }
    });

    this.loadUserProjects();
  }

  // Pagination methods for launched projects
  getLaunchedProjectsPaginated(): Project[] {
    const startIndex = (this.launchedProjectsPage - 1) * this.launchedProjectsPageSize;
    const endIndex = startIndex + this.launchedProjectsPageSize;
    return this.launchedProjects.slice(startIndex, endIndex);
  }

  onLaunchedProjectsPageChange(page: number): void {
    this.launchedProjectsPage = page;
  }

  // Pagination methods for ordered projects
  getOrderedProjectsPaginated(): any[] {
    const startIndex = (this.orderedProjectsPage - 1) * this.orderedProjectsPageSize;
    const endIndex = startIndex + this.orderedProjectsPageSize;
    return this.orderedProjects.slice(startIndex, endIndex);
  }

  onOrderedProjectsPageChange(page: number): void {
    this.orderedProjectsPage = page;
  }

  // Pagination methods for joined projects
  getJoinedProjectsPaginated(): any[] {
    const startIndex = (this.joinedProjectsPage - 1) * this.joinedProjectsPageSize;
    const endIndex = startIndex + this.joinedProjectsPageSize;
    return this.joinedProjects.slice(startIndex, endIndex);
  }

  onJoinedProjectsPageChange(page: number): void {
    this.joinedProjectsPage = page;
  }

  // Pagination methods for community projects
  getCommunityProjectsPaginated(): Project[] {
    const startIndex = (this.communityProjectsPage - 1) * this.communityProjectsPageSize;
    const endIndex = startIndex + this.communityProjectsPageSize;
    return this.communityProjects.slice(startIndex, endIndex);
  }

  onCommunityProjectsPageChange(page: number): void {
    this.communityProjectsPage = page;
  }

  async loadUserProjects() {
    this.isLoading = true;
    this.error = null;

    try {
      // Load launched projects
      const projects = await this.projectService.getUserProjects();
      this.launchedProjects = projects;
      this.launchedProjectsTotal = projects.length;

      // Load ordered projects
      const orderedProjects = await this.projectService.getUserOrderedProjects();
      this.orderedProjects = orderedProjects.map(project => this.transformOrderedProject(project));
      this.orderedProjectsTotal = this.orderedProjects.length;

      // TODO: Load joined projects when the API endpoint is available
      // const joinedProjects = await this.projectService.getUserJoinedProjects();
      // this.joinedProjects = joinedProjects.map(project => this.transformJoinedProject(project));
      
      // For now, set empty array until API is ready
      this.joinedProjects = [];
      this.joinedProjectsTotal = 0;

      // Load community projects from backend
      const communityProjects = await this.projectService.getUserCommunityProjects();
      this.communityProjects = communityProjects.map(project => this.transformCommunityProject(project));
      this.communityProjectsTotal = this.communityProjects.length;
    } catch (error) {
      console.error('Error loading projects:', error);
      this.error = 'Failed to load projects. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }

  private transformOrderedProject(project: OrderedProject): any {
    return {
      projectId: project.projectId,
      projectName: project.projectTitle, // Map projectTitle to projectName
      description: project.projectDescription, // Map projectDescription to description
      submittedOn: new Date(), // Since ordered projects don't have submission date, use current date
      updatedOn: new Date(), // Since ordered projects don't have update date, use current date
      status: project.status, // Keep the status as is
      // Add additional ordered project specific fields
      clientName: project.clientName,
      projectType: project.projectType,
      projectLocation: project.projectLocation,
      specialityOfProject: project.specialityOfProject,
      doYouHaveSponsorship: project.doYouHaveSponsorship,
      sponsorName: project.sponsorName,
      doYouNeedIntellectualProject: project.doYouNeedIntellectualProject,
      doYouNeedBusinessPlan: project.doYouNeedBusinessPlan,
      businessIdea: project.businessIdea,
      reasons: project.reasons
    };
  }

  private transformJoinedProject(project: JoinedProject): any {
    return {
      projectId: project.projectId,
      projectName: project.projectName,
      description: project.description,
      projectOwner: project.projectOwner,
      ownerEmail: project.ownerEmail,
      joinedDate: new Date(project.joinedDate),
      status: project.status,
      projectType: project.projectType,
      location: project.location
    };
  }

  private transformCommunityProject(project: CommunityProject): Project {
    return {
      projectId: project.id,
      projectName: project.projectName,
      description: project.description,
      submittedOn: project.createdAt,
      updatedOn: project.updatedOn,
      status: project.status as 'PENDING' | 'APPROVED' | 'DECLINED',
      category: project.category,
      projectLocation: project.location,
      projectPhotoUrl: project.projectPhoto,
      professionalStatus: project.profession,
      email: project.email,
      phone: project.phone,
      linkedIn: project.linkedIn
    };
  }

  editProject(project: Project) {
    // Check if it's a community project by looking for it in the community projects array
    const isCommunityProject = this.communityProjects.some(cp => cp.projectId === project.projectId);
    
    if (isCommunityProject) {
      // Community project - always allow editing regardless of status
      this.router.navigate([
        'dashboard/project/update/community',
        project.projectId,
      ]);
    } else {
      // Launched project - only allow editing for PENDING or DECLINED status
      if (project.status === 'PENDING' || project.status === 'DECLINED') {
        this.router.navigate([
          'dashboard/project/update/launched',
          project.projectId,
        ]);
      }
    }
  }

  editOrderedProject(project: any) {
    if (project.status === 'PENDING' || project.status === 'DECLINED') {
      this.router.navigate([
        'dashboard/project/update/ordered',
        project.projectId,
      ]);
    }
  }

  viewProjectDetails(project: Project) {
    this.router.navigate(['dashboard/project/details', project.projectId]);
  }

  viewOrderedProjectDetails(project: any) {
    this.router.navigate(['dashboard/project/details', project.projectId]);
  }

  viewJoinedProjectDetails(project: any) {
    this.router.navigate(['dashboard/project/details', project.projectId]);
  }

  viewCommunityProjectDetails(project: Project) {
    this.router.navigate(['dashboard/project/details', project.projectId]);
  }

  async deleteCommunityProject(project: Project) {
    this.showDeleteConfirmation(project, 'Community Project');
  }

  async confirmDeleteProject() {
    if (!this.projectToDelete) return;
    
    this.deletingProjectId = this.projectToDelete.projectId;
    try {
      if (this.projectToDelete.projectId) {
        // Determine which delete method to call based on project type
        if (this.projectToDelete.category) {
          // Community project
          await this.projectService.deleteCommunityProject(this.projectToDelete.projectId);
        } else if (this.projectToDelete.projectType) {
          // Ordered project
          await this.projectService.deleteOrderedProject(this.projectToDelete.projectId);
        } else {
          // Launched project
          await this.projectService.deleteLaunchedProject(this.projectToDelete.projectId);
        }
        
        // Refresh the projects list after successful deletion
        await this.loadUserProjects();
        console.log('Project deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      this.deletingProjectId = null;
      this.closeDeleteModal();
    }
  }

  async deleteLaunchedProject(project: Project) {
    this.showDeleteConfirmation(project, 'Launched Project');
  }

  async deleteOrderedProject(project: any) {
    this.showDeleteConfirmation(project, 'Ordered Project');
  }

  async deleteJoinedProject(project: any) {
    // This method is placeholder for when joined projects API is available
    alert('Delete functionality for joined projects is not yet available.');
  }

  // Refresh projects list
  async refreshProjects() {
    await this.loadUserProjects();
  }

  // Text truncation and popup methods
  truncateText(text: string, maxLength: number = 20): string {
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }

  shouldShowViewMore(text: string, maxLength: number = 20): boolean {
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

  showDeleteConfirmation(project: Project, type: string) {
    this.projectToDelete = project;
    this.deleteModalTitle = `Delete ${type}`;
    this.deleteModalMessage = `Are you sure you want to delete this ${type.toLowerCase()}? This action cannot be undone.`;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.projectToDelete = null;
    this.deleteModalTitle = '';
    this.deleteModalMessage = '';
  }
}
