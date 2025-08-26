import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnalyzerService, Analyzer, ProjectAnalyzer } from '../../../services/analyzer.service';
import { ProjectService, Project } from '../../../services/project.services';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CustomButtonComponent } from '../../../shared/components/custom-button/custom-button.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-launched-project-details',
  templateUrl: './launched-project-details.component.html',
  styleUrls: ['./launched-project-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    CustomButtonComponent,
    LoadingComponent
  ]
})
export class LaunchedProjectDetailsComponent implements OnInit {
  projectId!: string;
  project!: Project;
  analyzers: Analyzer[] = [];
  assignedAnalyzers: ProjectAnalyzer[] = [];
  availableAnalyzers: Analyzer[] = [];
  selectedAnalyzer: string = '';
  isLoading = true;
  error = false;
  analyzersLoading = false;
  analyzersError = false;
  assignedAnalyzersLoading = false;
  assignedAnalyzersError = false;
  assigningProject = false;
  unassigningProject = false;

  // Text truncation properties
  showFullText = false;
  expandedField = '';
  expandedText = '';

  constructor(
    private route: ActivatedRoute,
    private analyzerService: AnalyzerService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id')!;
    this.loadProjectDetails();
    this.loadAnalyzers();
    this.loadAssignedAnalyzers();
  }

  loadProjectDetails(): void {
    this.isLoading = true;
    this.error = false;

    this.projectService.getAllLaunchedProjects().subscribe({
      next: (projects) => {
        const foundProject = projects.find(p => p.projectId === this.projectId);
        if (foundProject) {
          this.project = foundProject;
        } else {
          this.error = true;
          console.error('Project not found with ID:', this.projectId);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading project details:', error);
        this.error = true;
        this.isLoading = false;
      }
    });
  }

  retryLoading(): void {
    this.loadProjectDetails();
    this.loadAnalyzers();
    this.loadAssignedAnalyzers();
  }

  loadAnalyzers(): void {
    this.analyzersLoading = true;
    this.analyzersError = false;
    
    this.analyzerService.getAnalyzers().subscribe({
      next: (analyzers) => {
        this.analyzers = analyzers;
        this.filterAvailableAnalyzers();
        this.analyzersLoading = false;
      },
      error: (error) => {
        console.error('Error loading analyzers:', error);
        this.analyzersError = true;
        this.analyzersLoading = false;
        // Keep empty array if API fails
        this.analyzers = [];
        this.availableAnalyzers = [];
      }
    });
  }

  loadAssignedAnalyzers(): void {
    this.assignedAnalyzersLoading = true;
    this.assignedAnalyzersError = false;
    
    this.analyzerService.getProjectAnalyzers(this.projectId).subscribe({
      next: (assignedAnalyzers) => {
        this.assignedAnalyzers = assignedAnalyzers;
        this.filterAvailableAnalyzers();
        this.assignedAnalyzersLoading = false;
      },
      error: (error) => {
        console.error('Error loading assigned analyzers:', error);
        this.assignedAnalyzersError = true;
        this.assignedAnalyzersLoading = false;
        // Keep empty array if API fails
        this.assignedAnalyzers = [];
        this.filterAvailableAnalyzers();
      }
    });
  }

  filterAvailableAnalyzers(): void {
    if (this.analyzers.length > 0) {
      const assignedAnalyzerIds = this.assignedAnalyzers.map(analyzer => analyzer.id);
      this.availableAnalyzers = this.analyzers.filter(analyzer => 
        !assignedAnalyzerIds.includes(analyzer.id)
      );
    }
  }

  assignProject(): void {
    if (this.selectedAnalyzer) {
      const analyzer = this.getSelectedAnalyzer();
      if (analyzer) {
        this.assigningProject = true;
        this.projectService.assignProject(this.projectId, analyzer.id).subscribe({
          next: (response) => {
            // Clear the selection
            this.selectedAnalyzer = '';
            // Reload assigned analyzers to reflect the change
            this.loadAssignedAnalyzers();
            this.assigningProject = false;
            // You might want to show a success message here
          },
          error: (error) => {
            this.assigningProject = false;
            // You might want to show an error message here
          }
        });
      }
    }
  }

  unassignProject(analyzerId: string): void {
    if (confirm('Are you sure you want to unassign this analyzer from the project?')) {
      this.unassigningProject = true;
      this.projectService.unassignProject(this.projectId, analyzerId).subscribe({
        next: (response) => {
          // Reload assigned analyzers to reflect the change
          this.loadAssignedAnalyzers();
          this.unassigningProject = false;
          // You might want to show a success message here
        },
        error: (error) => {
          this.unassigningProject = false;
          // You might want to show an error message here
        }
      });
    }
  }

  getSelectedAnalyzer(): Analyzer | null {
    return this.availableAnalyzers.find(a => a.id === this.selectedAnalyzer) || null;
  }

  // Text truncation functionality
  shouldTruncate(text: string): boolean {
    return Boolean(text && text.length > 25);
  }

  getTruncatedText(text: string): string {
    if (!text) return '';
    return text.length > 25 ? text.substring(0, 25) + '...' : text;
  }

  showFullTextPopup(text: string, fieldName: string): void {
    this.expandedField = fieldName;
    this.expandedText = text;
    this.showFullText = true;
  }

  closeFullTextPopup(): void {
    this.showFullText = false;
    this.expandedField = '';
    this.expandedText = '';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'status-approved';
      case 'DECLINED':
        return 'status-declined';
      case 'PENDING_QUERY':
        return 'status-pending-query';
      case 'QUERY':
        return 'status-query';
      case 'PENDING':
      default:
        return 'status-pending';
    }
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
