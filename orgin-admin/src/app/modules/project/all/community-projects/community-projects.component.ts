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
  selector: 'app-assigned-community',
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
export class ProjectsCommunityComponent implements OnInit {
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  dataSource = new MatTableDataSource<Project>([]);
  pageSizeOptions = [5, 10, 20];
  loading = true;
  error = false;
  errorMessage = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadAllCommunityProjects();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.cdr.detectChanges();
  }

  loadAllCommunityProjects(): void {
    this.loading = true;
    this.error = false;
    
    this.projectService.getAllCommunityProjects().subscribe({
      next: (communityProjects: CommunityProject[]) => {
        const projects = communityProjects.map(project => ({
          id: project.id,
          title: project.projectName,
          description: project.description,
          dateOfSubmission: new Date(project.createdAt),
          lastUpdated: new Date(project.updatedOn),
          status: project.status
        }));
        this.dataSource.data = projects;
        this.calculateTotalPages();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading all community projects:', error);
        this.error = true;
        this.errorMessage = 'Failed to load community projects. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
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

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.calculateTotalPages();
  }

  viewProjectDetails(project: Project): void {
    this.router.navigate(['dashboard/project/community/details', project.id]);
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

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.calculateTotalPages();
  }

  retryLoading(): void {
    this.loadAllCommunityProjects();
  }
}
