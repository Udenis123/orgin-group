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
import { ProjectService, CommunityProject } from '../../../../services/project.services';

export interface Project {
  id: string;
  title: string;
  description: string;
  dateOfSubmission: Date;
  lastUpdated: Date;
  status: string;
}

@Component({
  selector: 'app-community-projects',
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
  providers: [ProjectService],
  templateUrl: './community-projects.component.html',
  styleUrls: ['./community-projects.component.scss']
})
export class SubmittedCommunityProjectsComponent implements OnInit {
  displayedColumns: string[] = ['number', 'title', 'description', 'dateOfSubmission', 'lastUpdated', 'status', 'actions'];
  dataSource: MatTableDataSource<Project>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  projects: Project[] = [];
  loading = true;
  error = false;
  errorMessage = '';

  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];
  pageSize = this.pageSizeOptions[0];
  totalPages = 0;

  constructor(
    private router: Router,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private projectService: ProjectService
  ) {
    this.dataSource = new MatTableDataSource(this.projects);
  }

  ngOnInit(): void {
    this.loadPendingCommunityProjects();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.calculateTotalPages();
    this.cdr.detectChanges();
  }

  loadPendingCommunityProjects(): void {
    this.loading = true;
    this.error = false;
    
    this.projectService.getPendingCommunityProjects().subscribe({
      next: (communityProjects: CommunityProject[]) => {
        this.projects = communityProjects.map(project => ({
          id: project.id,
          title: project.projectName,
          description: project.description,
          dateOfSubmission: new Date(project.createdAt),
          lastUpdated: new Date(project.updatedOn),
          status: project.status
        }));
        this.dataSource.data = this.projects;
        this.calculateTotalPages();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading pending community projects:', error);
        this.error = true;
        this.errorMessage = 'Failed to load community projects. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.dataSource.filteredData.length / this.pageSize);
    this.cdr.detectChanges();
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

  get paginatedData() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.dataSource.filteredData.slice(start, end);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.calculateTotalPages();
  }

  viewProjectDetails(project: Project) {
    this.router.navigate(['dashboard/project/community/details', project.id]);
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.calculateTotalPages();
  }

  retryLoading(): void {
    this.loadPendingCommunityProjects();
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
