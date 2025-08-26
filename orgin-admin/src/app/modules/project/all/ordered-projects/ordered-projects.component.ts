import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService, OrderedProject } from '../../../../services/project.services';

export interface Project {
  id: number;
  title: string;
  description: string;
  dateOfSubmission: Date;
  lastUpdated: Date;
          status: 'Approved' | 'Declined' | 'Pending' | 'Pending Query' | 'Query';
}

@Component({
  selector: 'app-assigned-ordered',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    TranslateModule,
    DatePipe,
    CommonModule,
    FormsModule
  ],
  templateUrl: './ordered-projects.component.html',
  styleUrls: ['./ordered-projects.component.scss']
})
export class ProjectsOrderedComponent implements OnInit {
  displayedColumns: string[] = ['number', 'title', 'description', 'dateOfSubmission', 'lastUpdated', 'status', 'actions'];
  dataSource = new MatTableDataSource<Project>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  projects: Project[] = [];
  originalOrderedProjects: OrderedProject[] = []; // Store original data for navigation
  loading = false;
  error = '';

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
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadAllProjects();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.cdr.detectChanges();
  }

  async loadAllProjects(): Promise<void> {
    this.loading = true;
    this.error = '';
    
    try {
      const orderedProjects = await this.projectService.getAllOrderedProjects().toPromise();
      if (orderedProjects) {
        this.originalOrderedProjects = orderedProjects; // Store original data
        this.projects = orderedProjects.map((project, index) => ({
          id: index + 1, // Using index as ID since we don't have a numeric ID
          title: project.projectTitle,
          description: project.projectDescription,
          dateOfSubmission: new Date(), // API doesn't provide submission date, using current date
          lastUpdated: new Date(), // API doesn't provide last updated date, using current date
          status: this.mapStatus(project.status)
        }));
        
        this.dataSource.data = this.projects;
        this.calculateTotalPages();
      }
    } catch (error) {
      console.error('Error loading all projects:', error);
      this.error = 'Failed to load projects. Please try again.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private mapStatus(apiStatus: string): 'Approved' | 'Declined' | 'Pending' | 'Pending Query' | 'Query' {
    // API returns status in uppercase, but we need to handle it properly
    console.log('Mapping status:', apiStatus, 'to lowercase:', apiStatus.toLowerCase());
    switch (apiStatus.toUpperCase()) {
      case 'APPROVED':
        return 'Approved';
      case 'DECLINED':
        return 'Declined';
      case 'PENDING_QUERY':
        return 'Pending Query';
      case 'QUERY':
        return 'Query';
      case 'PENDING':
      default:
        return 'Pending';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'status-approved';
      case 'Declined':
        return 'status-declined';
      case 'Pending Query':
        return 'status-pending_query';
      case 'Query':
        return 'status-query';
      case 'Pending':
      default:
        return 'status-pending';
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.calculateTotalPages();
  }

  viewProjectDetails(project: Project): void {
    // Find the original ordered project data to get the actual projectId (UUID)
    const originalProject = this.originalOrderedProjects.find((_, index) => index === project.id - 1);
    if (originalProject) {
      this.router.navigate(['dashboard/project/ordered/details', originalProject.projectId]);
    }
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
