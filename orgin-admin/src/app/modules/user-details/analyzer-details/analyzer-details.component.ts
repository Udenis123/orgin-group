import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyzerService, AnalyzerDetails } from '../../../services/analyzer.service';

interface AnalyzerWorkStats {
  projectsAnalyzed: number;
  projectsApproved: number;
  projectsDeclined: number;
  totalProjectsAssigned: number;
  currentAssignedProjects: number;
}

@Component({
  selector: 'app-analyzer-details',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './analyzer-details.component.html',
  styleUrl: './analyzer-details.component.scss'
})
export class AnalyzerDetailsComponent implements OnInit {
  analyzerId: string | null = null;
  analyzerDetails: AnalyzerDetails | null = null;
  analyzerWorkStats: AnalyzerWorkStats = {
    projectsAnalyzed: 0,
    projectsApproved: 0,
    projectsDeclined: 0,
    totalProjectsAssigned: 0,
    currentAssignedProjects: 0
  };
  isLoading = true;
  error = false;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private analyzerService: AnalyzerService
  ) {}

  ngOnInit(): void {
    this.analyzerId = this.route.snapshot.paramMap.get('id');
    if (this.analyzerId) {
      this.loadAnalyzerDetails();
    } else {
      this.error = true;
      this.isLoading = false;
    }
  }

  loadAnalyzerDetails(): void {
    this.isLoading = true;
    this.error = false;

    this.analyzerService.getAnalyzerDetails(this.analyzerId!).subscribe({
      next: (details) => {
        this.analyzerDetails = details;
        this.calculateWorkStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading analyzer details:', error);
        this.error = true;
        this.isLoading = false;
      }
    });
  }

  calculateWorkStats(): void {
    if (!this.analyzerDetails?.assignedProjects) {
      console.log('No assigned projects found for analyzer');
      return;
    }

    const assignedProjects = this.analyzerDetails.assignedProjects;
    console.log('All assigned projects:', assignedProjects);
    console.log('Total assigned projects count:', assignedProjects.length);
    
    // Log each assigned project with its status
    assignedProjects.forEach((project, index) => {
      console.log(`Assigned Project ${index + 1}:`, {
        projectId: project.projectId,
        projectName: project.projectName,
        status: project.status,
        description: project.description
      });
    });
    
    // Total projects assigned to this analyzer (regardless of status)
    this.analyzerWorkStats.totalProjectsAssigned = assignedProjects.length;
    console.log('Total projects assigned:', this.analyzerWorkStats.totalProjectsAssigned);
    
    // Current assigned projects (projects with PENDING status)
    const pendingProjects = assignedProjects.filter(
      project => project.status === 'PENDING'
    );
    console.log('Pending projects:', pendingProjects);
    console.log('Pending projects count:', pendingProjects.length);
    
    this.analyzerWorkStats.currentAssignedProjects = pendingProjects.length;
    console.log('Current assigned projects (final):', this.analyzerWorkStats.currentAssignedProjects);
    
    // Projects analyzed by this analyzer (projects with APPROVED or DECLINED status)
    const analyzedProjects = assignedProjects.filter(
      project => project.status === 'APPROVED' || project.status === 'DECLINED'
    );
    
    this.analyzerWorkStats.projectsAnalyzed = analyzedProjects.length;
    console.log('Projects analyzed:', this.analyzerWorkStats.projectsAnalyzed);
    
    // Projects approved by this analyzer
    this.analyzerWorkStats.projectsApproved = assignedProjects.filter(
      project => project.status === 'APPROVED'
    ).length;
    console.log('Projects approved:', this.analyzerWorkStats.projectsApproved);
    
    // Projects declined by this analyzer
    this.analyzerWorkStats.projectsDeclined = assignedProjects.filter(
      project => project.status === 'DECLINED'
    ).length;
    console.log('Projects declined:', this.analyzerWorkStats.projectsDeclined);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/users/all/analyzers']);
  }
}
