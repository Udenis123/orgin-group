import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import {
  ProjectService,
  LaunchProjectResponse,
  AnalyzerInfo,
} from '../../../services/project.service';
import { CookieService } from 'ngx-cookie-service';

export interface AssignedProjectDetails {
  id: string;
  name: string;
  projectDescription: string;
  status: string;
  assignedTo: string[];
  dateOfAssignment: Date;
  lastUpdated: Date;
  projectType?: 'launch';
  category?: string;
  location?: string;
  speciality?: string;
  professionalStatus?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  projectStatus?: string;
  prototypeLink?: string;
  employeesCount?: number;
  monthlyIncome?: number;
  websiteUrl?: string;
  hasSponsorship?: string;
  sponsorName?: string;
  needsSponsor?: string;
  orginSponsorship?: string;
  sellProject?: string;
  projectInvestment?: number;
  incomeStatement?: string;
  cashFlowStatement?: string;
  balanceSheet?: string;
  pitchingVideo?: string;
  businessPlan?: string;
  businessIdeaDocument?: string;
  businessIdea?: string;
  launchDetails?: {
    fundingGoal?: number;
    backersCount?: number;
    daysRemaining?: number;
  };
  orderDetails?: {
    clientName?: string;
    companyName?: string;
    projectBudget?: number;
  };
  communityDetails?: {
    membersCount?: number;
    eventsCount?: number;
    discussionTopics?: string[];
    memberProfessions?: { profession: string; count: number }[];
  };
  fullName?: string;
  documentThumbnails?: {
    incomeStatement?: string;
    cashFlowStatement?: string;
    balanceSheet?: string;
    pitchingVideo?: string;
    businessPlan?: string;
    businessIdeaDocument?: string;
  };
  thumbnail?: string;
  analytics?: any;
  isAssigned: boolean;
  documents: {
    projectThumbnail: string;
    incomeStatement: string;
    cashFlowStatement: string;
    balanceSheet: string;
    businessPlan: string;
    businessIdeaDocument: string;
    pitchingVideo: string;
  };
  wantsIP?: boolean;
  needsBusinessPlan?: boolean;
  projectName?: string;
  feedback?: string;
}

// Update the dummy image URLs
const DUMMY_IMAGES = {
  ecoPackaging: 'https://picsum.photos/400/300?random=1',
  incomeThumb: 'https://picsum.photos/100/100?random=2',
  cashflowThumb: 'https://picsum.photos/100/100?random=3',
  balanceThumb: 'https://picsum.photos/100/100?random=4',
  planThumb: 'https://picsum.photos/100/100?random=5',
};

@Component({
  selector: 'app-assigned-project-details',
  templateUrl: './assigned-project-details.component.html',
  styleUrls: ['./assigned-project-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
})
export class AssignedProjectDetailsComponent implements OnInit {
  project: LaunchProjectResponse | null = null;
  loading = true;
  error: string | null = null;
  assigning = false;
  showSelfAssignButton = false;
  projectId: string | null = null;
  showAnalyzers = false;
  loadingAnalyzers = false;
  assignedAnalyzers: AnalyzerInfo[] = [];
  analyzersError: string | null = null;
  currentAnalyzerId: string = '';
  showVideoModal = false;
  currentVideoUrl: string | null = null;
  downloadingFile = false;
  downloadError: string | null = null;

  // Add these properties
  ecoPackagingImage = DUMMY_IMAGES.ecoPackaging;
  incomeThumbImage = DUMMY_IMAGES.incomeThumb;
  cashflowThumbImage = DUMMY_IMAGES.cashflowThumb;
  balanceThumbImage = DUMMY_IMAGES.balanceThumb;
  planThumbImage = DUMMY_IMAGES.planThumb;

  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService,
    private router: Router,
    private projectService: ProjectService,
    private cookieService: CookieService
  ) {
    this.currentAnalyzerId = this.cookieService.get('analyzerUserId');
  }

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.projectId = projectId;
      this.loadProjectDetails(projectId);
    } else {
      this.error = 'No project ID provided';
      this.loading = false;
    }
  }

  loadProjectDetails(projectId: string): void {
    this.loading = true;
    this.error = null;

    // First check if project exists in cache
    const project = this.projectService.getProjectById(projectId);
    if (project) {
      this.project = project;
      this.loading = false;
      return;
    }

    // If not in cache, refresh assigned projects
    this.projectService.getAllAssignedProjects().subscribe({
      next: (projects) => {
        const refreshedProject = this.projectService.getProjectById(projectId);
        if (refreshedProject) {
          this.project = refreshedProject;
        } else {
          // If still not found, try pending projects
          this.projectService.getAllPendingProjects().subscribe({
            next: () => {
              const pendingProject =
                this.projectService.getProjectById(projectId);
              if (pendingProject) {
                this.project = pendingProject;
              } 
              this.loading = false;
            },
            error: (error) => {
              console.error('Error loading pending projects:', error);
              this.error = 'Failed to load project details';
              this.loading = false;
            },
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading assigned projects:', error);
        this.error = 'Failed to load project details';
        this.loading = false;
      },
    });
  }

  loadProjectAnalysts(): void {
    if (!this.project || !this.project.projectId) {
      this.analyzersError = 'Project ID not available';
      return;
    }

    this.loadingAnalyzers = true;
    this.analyzersError = null;

    this.projectService.getProjectAnalysts(this.project.projectId).subscribe({
      next: (analysts) => {
        this.assignedAnalyzers = analysts;
        this.loadingAnalyzers = false;
      },
      error: (error) => {
        console.error('Error loading project analysts:', error);
        this.analyzersError = 'Failed to load project analysts';
        this.loadingAnalyzers = false;
        this.assignedAnalyzers = [];
      },
    });
  }

  hasProjectInfo(): boolean {
    return !!this.project?.projectStatus || !!this.project?.website;
  }

  hasBasicInfo(): boolean {
    return (
      !!this.project?.category ||
      !!this.project?.projectLocation ||
      !!this.project?.email ||
      !!this.project?.phone ||
      !!this.project?.linkedIn
    );
  }

  get downloadText(): string {
    return this.translate.instant('projectDetails.buttons.download');
  }

  get previewText(): string {
    return this.translate.instant('projectDetails.buttons.preview');
  }

  previewVideo(videoUrl: string) {
    this.currentVideoUrl = videoUrl;
    this.showVideoModal = true;
  }

  closeVideoModal() {
    this.showVideoModal = false;
    this.currentVideoUrl = null;
  }

  addAnalytics(): void {
    if (this.project?.projectId) {
      this.router.navigate([
        '/dashboard/projects/add-analytics',
        this.project.projectId,
      ]);
    } else {
      console.error('Project ID is not available');
    }
  }

  goBack() {
    this.router.navigate(['/dashboard/projects/assigned/launched']);
  }

  selfAssignProject() {
    if (!this.project || this.assigning) return;

    this.assigning = true;
    this.error = null;

    try {
      this.projectService.assignProject(this.project.projectId).subscribe({
        next: () => {
          this.error = null;
          this.projectService.refreshProjects();
          this.loadProjectDetails(this.project!.projectId);
          this.assigning = false;
        },
        error: (error) => {
          console.error('Error assigning project:', error);
          this.error = 'Failed to assign project';
          this.assigning = false;
        },
      });
    } catch (error) {
      this.assigning = false;
      console.error('Error assigning project:', error);
      this.error = 'Failed to assign project';
    }
  }

  unassignProject() {
    if (!this.project || this.assigning) return;

    this.assigning = true;
    this.error = null;

    try {
      this.projectService.unassignProject(this.project.projectId).subscribe({
        next: () => {
          this.error = null;
          this.projectService.refreshProjects();
          this.loadProjectDetails(this.project!.projectId);
          this.assigning = false;
        },
        error: (error: Error) => {
          console.error('Error unassigning project:', error);
          this.error = 'Failed to unassign project';
          this.assigning = false;
        },
      });
    } catch (error) {
      this.assigning = false;
      console.error('Error unassigning project:', error);
      this.error = 'Failed to unassign project';
    }
  }

  toggleAnalyzers() {
    this.showAnalyzers = !this.showAnalyzers;
    if (
      this.showAnalyzers &&
      this.assignedAnalyzers.length === 0 &&
      !this.loadingAnalyzers
    ) {
      this.loadProjectAnalysts();
    }
  }

  isCurrentUser(analyzer: AnalyzerInfo): boolean {
    return analyzer.analyzerId === this.currentAnalyzerId;
  }

  downloadFile(url: string, filename: string) {
    this.downloadingFile = true;
    this.downloadError = null;

    console.log('Downloading file:', { url, filename });

    this.projectService.downloadFile(url, filename).subscribe({
      next: () => {
        console.log('File download completed successfully');
        this.downloadingFile = false;
      },
      error: (error) => {
        console.error('Error downloading file:', error);
        this.downloadingFile = false;
        if (error.status === 0) {
          this.downloadError = 'Network error. Please check your connection and try again.';
        } else if (error.status === 401) {
          this.downloadError = 'Authentication error. Please log in again.';
        } else if (error.status === 403) {
          this.downloadError = 'Access denied. You do not have permission to download this file.';
        } else if (error.status === 404) {
          this.downloadError = 'File not found. The file may have been removed.';
        } else {
          this.downloadError = `Failed to download file. Error: ${error.message}`;
        }
      }
    });
  }
}
