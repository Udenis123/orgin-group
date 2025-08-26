import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService, CommunityProject } from '../../../services/project.services';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-community-project-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [ProjectService],
  templateUrl: './community-project-details.component.html',
  styleUrl: './community-project-details.component.scss'
})
export class CommunityProjectDetailsComponent implements OnInit {
  project: CommunityProject | null = null;
  loading = true;
  error = false;
  errorMessage = '';
  showDeclinePopup = false;
  declineReason = '';
  actionLoading = false;
  showMessage = false;
  messageText = '';
  messageType = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadProjectDetails();
  }

  loadProjectDetails(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId) {
      this.error = true;
      this.errorMessage = 'Project ID not found';
      this.loading = false;
      return;
    }

    this.projectService.getCommunityProjectById(projectId).subscribe({
      next: (project: CommunityProject) => {
        this.project = project;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading project details:', error);
        this.error = true;
        this.errorMessage = 'Failed to load project details. Please try again.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/project/all/community-projects']);
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  approveProject(): void {
    if (!this.project) return;
    
    this.actionLoading = true;
    this.projectService.approveCommunityProject(this.project.id).subscribe({
      next: () => {
        this.actionLoading = false;
        this.showSuccessMessage('Project approved successfully!');
        // Reload project details to get updated status
        this.loadProjectDetails();
      },
      error: (error: any) => {
        this.actionLoading = false;
        console.error('Error approving project:', error);
        this.showErrorMessage('Failed to approve project. Please try again.');
      }
    });
  }

  showDeclineDialog(): void {
    this.showDeclinePopup = true;
    this.declineReason = '';
  }

  closeDeclineDialog(): void {
    this.showDeclinePopup = false;
    this.declineReason = '';
  }

  confirmDecline(): void {
    if (!this.project || !this.declineReason.trim()) return;
    
    this.actionLoading = true;
    this.projectService.declineCommunityProject(this.project.id, this.declineReason.trim()).subscribe({
      next: () => {
        this.actionLoading = false;
        this.closeDeclineDialog();
        this.showSuccessMessage('Project declined successfully!');
        // Reload project details to get updated status
        this.loadProjectDetails();
      },
      error: (error: any) => {
        this.actionLoading = false;
        console.error('Error declining project:', error);
        this.showErrorMessage('Failed to decline project. Please try again.');
      }
    });
  }

  showSuccessMessage(message: string): void {
    this.messageType = 'success';
    this.messageText = message;
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }

  showErrorMessage(message: string): void {
    this.messageType = 'error';
    this.messageText = message;
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }

  getDisplayStatus(status: string): string {
    switch (status) {
      case 'PENDING_QUERY':
        return 'Pending Query';
      case 'QUERY':
        return 'Query';
      case 'PENDING':
        return 'Pending';
      case 'APPROVED':
        return 'Approved';
      case 'DECLINED':
        return 'Declined';
      default:
        return status;
    }
  }
}
