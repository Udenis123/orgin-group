import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import {
  ProjectService,
  LaunchProjectResponse,
} from '../../../services/project.service';

export interface ProjectDetails {
  id: number;
  name: string;
  description: string;
  dateOfSubmission: Date;
  lastUpdated: Date;
  status: string;
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
  projectType?: 'launch' | 'order' | 'community';
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
  assignedTo: string[];
}

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgbModule, FormsModule],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss'],
})
export class ProjectDetailsComponent implements OnInit {
  project: LaunchProjectResponse | null = null;
  loading = true;
  error: string | null = null;
  assigning = false;
  showVideoModal = false;
  currentVideoUrl: string | null = null;
  downloadingFile = false;
  downloadError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public translate: TranslateService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.loadProjectDetails(projectId);
    } else {
      this.error = 'No project ID provided';
      this.loading = false;
    }
  }

  loadProjectDetails(projectId: string) {
    this.loading = true;
    this.error = null;

    // First check if project exists in cache
    const project = this.projectService.getProjectById(projectId);
    if (project) {
      this.project = project;
      this.loading = false;
      return;
    }

    // If not in cache, refresh projects and wait for the data
    this.projectService.getAllPendingProjects().subscribe({
      next: (projects) => {
        const refreshedProject = this.projectService.getProjectById(projectId);
        if (refreshedProject) {
          this.project = refreshedProject;
        } else {
          // If still not found, try assigned projects
          this.projectService.getAllAssignedProjects().subscribe({
            next: () => {
              const assignedProject = this.projectService.getProjectById(projectId);
              if (assignedProject) {
                this.project = assignedProject;
              } 
              this.loading = false;
            },
            error: (error) => {
              console.error('Error loading assigned projects:', error);
              this.error = this.translate.instant('errors.generalError');
              this.loading = false;
            }
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading project details:', error);
        this.error = this.translate.instant('errors.generalError');
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['dashboard/projects/submitted/launched']);
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

  selfAssignProject() {
    if (!this.project || this.assigning) return;

    this.assigning = true;
    this.error = null;

    try {
      this.projectService.assignProject(this.project.projectId).subscribe({
        next: () => {
          this.error = null;
          this.projectService.refreshProjects();
          this.router.navigate(['dashboard/projects/submitted/launched']);
        },
        error: (error) => {
          console.error('Error assigning project:', error);
          if (error.message === 'Analyzer ID not found in cookies') {
            this.error = this.translate.instant('errors.analyzerNotFound');
          } else if (error.status === 400) {
            this.error = this.translate.instant('errors.assignmentFailed');
          } else {
            this.error = this.translate.instant('errors.generalError');
          }
        },
        complete: () => {
          this.assigning = false;
        },
      });
    } catch (error) {
      this.assigning = false;
      if (
        error instanceof Error &&
        error.message === 'Analyzer ID not found in cookies'
      ) {
        this.error = this.translate.instant('errors.analyzerNotFound');
      } else {
        this.error = this.translate.instant('errors.generalError');
      }
    }
  }
}
