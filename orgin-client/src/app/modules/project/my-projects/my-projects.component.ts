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
  communityProjects: Project[] = [];
  isLoading = false;
  error: string | null = null;

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

  async loadUserProjects() {
    this.isLoading = true;
    this.error = null;

    try {
      // Load launched projects
      const projects = await this.projectService.getUserProjects();
      this.launchedProjects = projects;

      // Load ordered projects
      const orderedProjects = await this.projectService.getUserOrderedProjects();
      this.orderedProjects = orderedProjects.map(project => this.transformOrderedProject(project));

      // TODO: Load community projects when the endpoint is available
      // this.communityProjects = await this.projectService.getUserCommunityProjects();
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

  editProject(project: Project) {
    if (project.status === 'PENDING' || project.status === 'DECLINED') {
      this.router.navigate([
        'dashboard/project/update/launched',
        project.projectId,
      ]);
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

  // Refresh projects list
  async refreshProjects() {
    await this.loadUserProjects();
  }
}
