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
  ],
  templateUrl: './launched-projects.component.html',
  styleUrls: ['./launched-projects.component.scss'],
})
export class AssignedLaunchedProjectsComponent implements OnInit {
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
    this.loadAssignedProjects();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.calculateTotalPages();
      this.cdr.detectChanges();
    });
  }

  loadAssignedProjects() {
    this.projectService.getAllAssignedProjects().subscribe({
      next: (projects) => {
        this.dataSource = new MatTableDataSource(projects);
        this.calculateTotalPages();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading assigned projects:', error);
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
      'dashboard/projects/assigned/details',
      project.projectId,
    ]);
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
    this.totalPages = Math.ceil(
      this.dataSource.filteredData.length / this.pageSize
    );
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
}
