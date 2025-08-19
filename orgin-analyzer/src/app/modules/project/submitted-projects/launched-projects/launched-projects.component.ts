import { Component, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
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
import {
  ProjectService,
  LaunchProjectResponse,
} from '../../../../services/project.service';

@Component({
  selector: 'app-launched-projects',
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
  ],
  templateUrl: './launched-projects.component.html',
  styleUrls: ['./launched-projects.component.scss'],
})
export class SubmittedLaunchedProjectsComponent implements OnInit {
  displayedColumns: string[] = [
    'number',
    'title',
    'description',
    'dateOfSubmission',
    'lastUpdated',
    'status',
    'actions',
  ];
  dataSource: MatTableDataSource<LaunchProjectResponse>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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
    this.dataSource = new MatTableDataSource<LaunchProjectResponse>([]);
  }

  ngOnInit() {
    this.loadPendingProjects();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.calculateTotalPages();
      this.cdr.detectChanges();
    });
  }

  loadPendingProjects() {
    // First load both pending and assigned projects to ensure filtering works correctly
    this.projectService.getAllPendingProjects().subscribe();
    this.projectService.getAllAssignedProjects().subscribe();
    
    // Then subscribe to the filtered pending projects
    this.projectService.getFilteredPendingProjects().subscribe({
      next: (projects) => {
        this.dataSource = new MatTableDataSource(projects);
        this.calculateTotalPages();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        // Handle error appropriately
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  viewProjectDetails(project: LaunchProjectResponse) {
    this.router.navigate([
      'dashboard/projects/submitted/details',
      project.projectId,
    ]);
  }

  previousPage() {
    if (this.currentPage > 0) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) this.currentPage++;
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(
      this.dataSource.filteredData.length / this.pageSize
    );
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
}
