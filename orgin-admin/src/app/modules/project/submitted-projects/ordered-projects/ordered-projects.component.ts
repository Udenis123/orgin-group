import { Component, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
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
  status: 'Pending';
}

@Component({
  selector: 'app-ordered-projects',
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
export class SubmittedOrderedProjectsComponent implements OnInit {
  displayedColumns: string[] = ['number', 'title', 'description', 'dateOfSubmission', 'lastUpdated', 'status', 'actions'];
  dataSource: MatTableDataSource<Project>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  projects: Project[] = [];
  originalOrderedProjects: OrderedProject[] = []; // Store original data for navigation
  loading = false;
  error = '';

  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];
  pageSize = this.pageSizeOptions[0];
  totalPages = 0;

  // Text truncation properties
  showFullText = false;
  expandedField = '';
  expandedText = '';

  constructor(
    private router: Router,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private projectService: ProjectService
  ) {
    this.dataSource = new MatTableDataSource(this.projects);
  }

  ngOnInit(): void {
    this.loadPendingProjects();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.calculateTotalPages();
    this.cdr.detectChanges();
  }

  async loadPendingProjects(): Promise<void> {
    this.loading = true;
    this.error = '';
    
    try {
      const orderedProjects = await this.projectService.getPendingOrderedProjects().toPromise();
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
      console.error('Error loading pending projects:', error);
      this.error = 'Failed to load projects. Please try again.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private mapStatus(apiStatus: string): 'Pending' {
    // API returns status in uppercase, but we need to handle it properly
    console.log('Mapping status:', apiStatus, 'to lowercase:', apiStatus.toLowerCase());
    switch (apiStatus.toUpperCase()) {
      case 'PENDING':
      default:
        return 'Pending';
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.calculateTotalPages();
  }

  viewProjectDetails(project: Project): void {
    // Find the original ordered project data to get the actual projectId (UUID)
    const originalProject = this.originalOrderedProjects.find((_, index) => index === project.id - 1);
    if (originalProject) {
      this.router.navigate(['dashboard/project/ordered/details', originalProject.projectId]);
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.cdr.detectChanges();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.cdr.detectChanges();
    }
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.dataSource.filteredData.length / this.pageSize);
    this.cdr.detectChanges();
  }

  get paginatedData() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.dataSource.filteredData.slice(start, end);
  }

  onPageSizeChange() {
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
