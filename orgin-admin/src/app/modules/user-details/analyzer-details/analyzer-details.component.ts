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
    if (!this.analyzerDetails?.assignment) {
      console.log('No assignments found for analyzer');
      return;
    }

    const assignments = this.analyzerDetails.assignment;
    console.log('All assignments:', assignments);
    console.log('Total assignments count:', assignments.length);
    
    // Log each assignment with its project status
    assignments.forEach((assignment, index) => {
      console.log(`Assignment ${index + 1}:`, {
        assignmentId: assignment.id,
        projectId: assignment.project.projectId,
        projectName: assignment.project.projectName,
        projectStatus: assignment.project.status,
        analyzerId: assignment.analyzer
      });
    });
    
    // Total projects assigned to this analyzer
    this.analyzerWorkStats.totalProjectsAssigned = assignments.length;
    console.log('Total projects assigned:', this.analyzerWorkStats.totalProjectsAssigned);
    
    // Current assigned projects (projects with PENDING status assigned to this analyzer)
    const pendingAssignments = assignments.filter(
      assignment => assignment.project.status === 'PENDING'
    );
    console.log('Pending assignments:', pendingAssignments);
    console.log('Pending assignments count:', pendingAssignments.length);
    
    this.analyzerWorkStats.currentAssignedProjects = pendingAssignments.length;
    console.log('Current assigned projects (final):', this.analyzerWorkStats.currentAssignedProjects);
    
    // Projects analyzed by this analyzer (projects with APPROVED or DECLINED status)
    const analyzedProjects = assignments.filter(
      assignment => assignment.project.status === 'APPROVED' || assignment.project.status === 'DECLINED'
    );
    
    this.analyzerWorkStats.projectsAnalyzed = analyzedProjects.length;
    
    // Projects approved by this analyzer
    this.analyzerWorkStats.projectsApproved = assignments.filter(
      assignment => assignment.project.status === 'APPROVED'
    ).length;
    
    // Projects declined by this analyzer
    this.analyzerWorkStats.projectsDeclined = assignments.filter(
      assignment => assignment.project.status === 'DECLINED'
    ).length;
  }

  goBack(): void {
    this.router.navigate(['/dashboard/users/all/analyzers']);
  }
}
