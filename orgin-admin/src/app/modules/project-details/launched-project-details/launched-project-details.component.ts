import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnalyzerService } from '../../../services/analyzer.service';
import { ProjectService, Project } from '../../../services/project.services';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CustomButtonComponent } from '../../../shared/components/custom-button/custom-button.component';

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
    CustomButtonComponent
  ]
})
export class LaunchedProjectDetailsComponent implements OnInit {
  projectId!: string;
  project!: Project;
  analyzers: any[] = [];
  selectedAnalyzer: any;
  isLoading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private analyzerService: AnalyzerService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id')!;
    this.loadProjectDetails();
    this.loadAnalyzers();
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

  loadAnalyzers(): void {
    // Dummy analyzers data
    this.analyzers = [
      { id: 1, name: 'John Doe', expertise: 'AI & Machine Learning' },
      { id: 2, name: 'Jane Smith', expertise: 'Data Analytics' },
      { id: 3, name: 'Michael Johnson', expertise: 'Software Architecture' },
      { id: 4, name: 'Emily Davis', expertise: 'Cloud Computing' },
      { id: 5, name: 'David Wilson', expertise: 'Cybersecurity' }
    ];
  }

  assignProject(): void {
    if (this.selectedAnalyzer) {
      // Note: The Project interface doesn't have isAssigned and assignedAnalyzerName properties
      // These would need to be added to the backend response or handled differently
      console.log(`Project ${this.project.projectId} would be assigned to: ${this.selectedAnalyzer.name}`);
      // TODO: Implement actual assignment logic when backend supports it
    }
  }
}
