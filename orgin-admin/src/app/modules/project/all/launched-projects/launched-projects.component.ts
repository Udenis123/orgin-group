import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ProjectService } from '../../../../services/project.services';

export interface Project {
  balanceSheetUrl: string;
  projectId: string;
  businessIdea: string;
  businessPlanUrl: string;
  businessIdeaDocumentUrl: string;
  clientName: string;
  category: string;
  description: string;
  cashFlowUrl: string;
  status: string;
  professionalStatus: string;
  projectName: string;
  haveSponsorQ: string;
  projectPurpose: string;
  projectLocation: string;
  projectPhotoUrl: string;
  doSellProjectQ: string;
  submittedOn: string;
  projectAmount: number;
  needOrgQ: string;
  pitchingVideoUrl: string;
  sponsorName: string;
  website: string;
  incomeStatementUrl: string;
  prototypeLink: string;
  projectStatus: string;
  updatedOn: string;
  linkedIn: string;
  monthlyIncome: number;
  specialityOfProject: string;
  phone: string;
  needSponsorQ: string;
  numberOfEmp: number;
  wantOriginToBusinessPlanQ: string;
  intellectualProjectQ: string;
  email: string;
  feedback: string;
}

@Component({
  selector: 'app-assigned-launched',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatCardModule,
    TranslateModule,
    CommonModule,
    RouterModule,
    FormsModule,
    DatePipe
  ],
  templateUrl: './launched-projects.component.html',
  styleUrls: ['./launched-projects.component.scss']
})
export class ProjectsLaunchedComponent implements OnInit {
  displayedColumns: string[] = ['number', 'title', 'description', 'dateOfSubmission', 'lastUpdated', 'status', 'actions'];
  dataSource = new MatTableDataSource<Project>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  projects: Project[] = [
    {
      balanceSheetUrl: '',
      projectId: '1',
      businessIdea: 'AI Chatbot Platform',
      businessPlanUrl: '',
      businessIdeaDocumentUrl: '',
      clientName: 'John Doe',
      category: 'Technology',
      description: 'An intelligent chatbot solution for businesses',
      cashFlowUrl: '',
      status: 'APPROVED',
      professionalStatus: 'Entrepreneur',
      projectName: 'AI Chatbot Platform',
      haveSponsorQ: 'No',
      projectPurpose: 'Business Solution',
      projectLocation: 'Kigali',
      projectPhotoUrl: '',
      doSellProjectQ: 'No',
      submittedOn: '2024-01-10T00:00:00.000Z',
      projectAmount: 5000000,
      needOrgQ: 'No',
      pitchingVideoUrl: '',
      sponsorName: '',
      website: 'https://example.com',
      incomeStatementUrl: '',
      prototypeLink: 'https://prototype.example.com',
      projectStatus: 'Active',
      updatedOn: '2024-01-15T00:00:00.000Z',
      linkedIn: 'https://linkedin.com/in/johndoe',
      monthlyIncome: 1000000,
      specialityOfProject: 'AI/ML',
      phone: '+250123456789',
      needSponsorQ: 'No',
      numberOfEmp: 5,
      wantOriginToBusinessPlanQ: 'Yes',
      intellectualProjectQ: 'Yes',
      email: 'john@example.com',
      feedback: 'Great project with high potential'
    },
    {
      balanceSheetUrl: '',
      projectId: '2',
      businessIdea: 'Eco-Friendly Packaging',
      businessPlanUrl: '',
      businessIdeaDocumentUrl: '',
      clientName: 'Jane Smith',
      category: 'Environment',
      description: 'Sustainable packaging solutions',
      cashFlowUrl: '',
      status: 'DECLINED',
      professionalStatus: 'Business Owner',
      projectName: 'Eco-Friendly Packaging',
      haveSponsorQ: 'Yes',
      projectPurpose: 'Environmental Impact',
      projectLocation: 'Nairobi',
      projectPhotoUrl: '',
      doSellProjectQ: 'No',
      submittedOn: '2024-01-05T00:00:00.000Z',
      projectAmount: 3000000,
      needOrgQ: 'Yes',
      pitchingVideoUrl: '',
      sponsorName: 'Green Fund',
      website: 'https://eco.example.com',
      incomeStatementUrl: '',
      prototypeLink: 'https://prototype.eco.com',
      projectStatus: 'Inactive',
      updatedOn: '2024-01-10T00:00:00.000Z',
      linkedIn: 'https://linkedin.com/in/janesmith',
      monthlyIncome: 500000,
      specialityOfProject: 'Sustainability',
      phone: '+254123456789',
      needSponsorQ: 'Yes',
      numberOfEmp: 3,
      wantOriginToBusinessPlanQ: 'No',
      intellectualProjectQ: 'No',
      email: 'jane@example.com',
      feedback: 'Project needs more market research'
    },
    {
      balanceSheetUrl: '',
      projectId: '3',
      businessIdea: 'Smart Home Automation',
      businessPlanUrl: '',
      businessIdeaDocumentUrl: '',
      clientName: 'Mike Johnson',
      category: 'IoT',
      description: 'IoT-based home automation system',
      cashFlowUrl: '',
      status: 'PENDING',
      professionalStatus: 'Engineer',
      projectName: 'Smart Home Automation',
      haveSponsorQ: 'No',
      projectPurpose: 'Home Improvement',
      projectLocation: 'Kampala',
      projectPhotoUrl: '',
      doSellProjectQ: 'Yes',
      submittedOn: '2024-02-01T00:00:00.000Z',
      projectAmount: 8000000,
      needOrgQ: 'No',
      pitchingVideoUrl: '',
      sponsorName: '',
      website: 'https://smart.example.com',
      incomeStatementUrl: '',
      prototypeLink: 'https://prototype.smart.com',
      projectStatus: 'Under Review',
      updatedOn: '2024-02-05T00:00:00.000Z',
      linkedIn: 'https://linkedin.com/in/mikejohnson',
      monthlyIncome: 2000000,
      specialityOfProject: 'IoT',
      phone: '+256123456789',
      needSponsorQ: 'No',
      numberOfEmp: 8,
      wantOriginToBusinessPlanQ: 'Yes',
      intellectualProjectQ: 'Yes',
      email: 'mike@example.com',
      feedback: 'Under review'
    }
  ];

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions = [5, 10, 20];

  // Text truncation properties
  showFullText = false;
  expandedField = '';
  expandedText = '';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadLaunchedProjects();
  }

  loadLaunchedProjects(): void {
    this.projectService.getAllLaunchedProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.dataSource.data = this.projects;
        this.calculateTotalPages();
      },
      error: (error) => {
        console.error('Error loading launched projects:', error);
        // Fallback to hardcoded data if API fails
        this.dataSource.data = this.projects;
        this.calculateTotalPages();
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.cdr.detectChanges();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.calculateTotalPages();
  }

  viewProjectDetails(project: Project): void {
    this.router.navigate(['dashboard/project/launched/details', project.projectId]);
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.cdr.detectChanges();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.cdr.detectChanges();
    }
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.dataSource.filteredData.length / this.pageSize);
    this.cdr.detectChanges();
  }

  get paginatedData(): Project[] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.dataSource.filteredData.slice(start, end);
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.calculateTotalPages();
  }

  // Text truncation functionality
  shouldTruncate(text: string): boolean {
    return Boolean(text && text.length > 20);
  }

  getTruncatedText(text: string): string {
    if (!text) return '';
    return text.length > 20 ? text.substring(0, 20) + '...' : text;
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
}
