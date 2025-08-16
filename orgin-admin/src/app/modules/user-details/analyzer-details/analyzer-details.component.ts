import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface AnalyzerDetails {
  id: string;
  fullName: string;
  nationalId: string;
  nationality: string;
  email: string;
  country: string;
  phoneNumber: string;
  expertise: string;
}

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

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.analyzerId = this.route.snapshot.paramMap.get('id');
    this.loadAnalyzerDetails();
    this.loadAnalyzerWorkStats();
  }

  loadAnalyzerDetails(): void {
    // Dummy data for testing
    const dummyData: AnalyzerDetails[] = [
      {
        id: '1',
        fullName: 'John Doe',
        nationalId: '123456789',
        nationality: 'Kenyan',
        email: 'john.doe@example.com',
        country: 'KE',
        phoneNumber: '712345678',
        expertise: 'Soil Analysis'
      },
      {
        id: '2',
        fullName: 'Jane Smith',
        nationalId: '987654321',
        nationality: 'Ugandan',
        email: 'jane.smith@example.com',
        country: 'UG',
        phoneNumber: '712345679',
        expertise: 'Water Quality'
      }
    ];

    this.analyzerDetails = dummyData.find(data => data.id === this.analyzerId) || null;
  }

  loadAnalyzerWorkStats(): void {
    // Dummy data for testing
    const dummyStats = [
      { 
        id: '1', 
        projectsAnalyzed: 15, 
        projectsApproved: 10, 
        projectsDeclined: 5,
        totalProjectsAssigned: 20,
        currentAssignedProjects: 3
      },
      { 
        id: '2', 
        projectsAnalyzed: 8, 
        projectsApproved: 6, 
        projectsDeclined: 2,
        totalProjectsAssigned: 12,
        currentAssignedProjects: 2
      }
    ];

    const stats = dummyStats.find(data => data.id === this.analyzerId);
    this.analyzerWorkStats = stats || {
      projectsAnalyzed: 0,
      projectsApproved: 0,
      projectsDeclined: 0,
      totalProjectsAssigned: 0,
      currentAssignedProjects: 0
    };
  }

  goBack(): void {
    this.router.navigate(['/dashboard/users/all/analyzers']);
  }
}
