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
  project: Project | undefined;
  projectAnalytics?: ProjectAnalytics;
  error: string | null = null;
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
    try {
      const projectId = this.route.snapshot.paramMap.get('id');
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      this.project = await this.projectService.getProjectById(projectId);
      
      if (this.project.status === 'APPROVED') {
        try {
          this.projectAnalytics = await this.projectService.getProjectAnalytics(projectId);
        } catch (error) {
          console.error('Error loading project analytics:', error);
          // Don't set error state here as it's not critical
        }
      }
    } catch (error) {
      console.error('Error loading project details:', error);
      this.error = error instanceof Error ? error.message : 'An error occurred while loading the project';
      // Optionally navigate back or show error state
      // this.router.navigate(['dashboard/project/my-projects']);
    }
  }

  goBack() {
    this.router.navigate(['dashboard/project/my-projects']);
  }

  hasBasicInfo(): boolean {
    return !!this.project?.category || !!this.project?.projectLocation ||
           !!this.project?.email || !!this.project?.phone ||
           !!this.project?.linkedIn;
  }

  hasProjectInfo(): boolean {
    return !!this.project?.projectStatus || !!this.project?.website;
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
