import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
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
export class SubmittedOrderedProjectsComponent {
  displayedColumns: string[] = ['number', 'title', 'description', 'dateOfSubmission', 'lastUpdated', 'status', 'actions'];
  dataSource: MatTableDataSource<Project>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  projects: Project[] = [
    {
      id: 4,
      title: 'E-commerce Platform',
      description: 'Online marketplace for local artisans',
      dateOfSubmission: new Date('2024-01-20'),
      lastUpdated: new Date('2024-01-25'),
      status: 'Pending'
    },
    {
      id: 5,
      title: 'Mobile Banking App',
      description: 'Secure mobile banking solution',
      dateOfSubmission: new Date('2024-02-10'),
      lastUpdated: new Date('2024-02-15'),
      status: 'Pending'
    },
    {
      id: 6,
      title: 'Online Learning Platform',
      description: 'Interactive e-learning system',
      dateOfSubmission: new Date('2024-03-01'),
      lastUpdated: new Date('2024-03-05'),
      status: 'Pending'
    },
    {
      id: 5,
      title: 'Mobile Banking App',
      description: 'Secure mobile banking solution',
      dateOfSubmission: new Date('2024-02-10'),
      lastUpdated: new Date('2024-02-15'),
      status: 'Pending'
    },
    {
      id: 6,
      title: 'Online Learning Platform',
      description: 'Interactive e-learning system',
      dateOfSubmission: new Date('2024-03-01'),
      lastUpdated: new Date('2024-03-05'),
      status: 'Pending'
    },
    {
      id: 5,
      title: 'Mobile Banking App',
      description: 'Secure mobile banking solution',
      dateOfSubmission: new Date('2024-02-10'),
      lastUpdated: new Date('2024-02-15'),
      status: 'Pending'
    },
    {
      id: 6,
      title: 'Online Learning Platform',
      description: 'Interactive e-learning system',
      dateOfSubmission: new Date('2024-03-01'),
      lastUpdated: new Date('2024-03-05'),
      status: 'Pending'
    },
    {
      id: 5,
      title: 'Mobile Banking App',
      description: 'Secure mobile banking solution',
      dateOfSubmission: new Date('2024-02-10'),
      lastUpdated: new Date('2024-02-15'),
      status: 'Pending'
    },
    {
      id: 6,
      title: 'Online Learning Platform',
      description: 'Interactive e-learning system',
      dateOfSubmission: new Date('2024-03-01'),
      lastUpdated: new Date('2024-03-05'),
      status: 'Pending'
    }
  ];

  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];
  pageSize = this.pageSizeOptions[0];
  totalPages = 0;

  constructor(
    private router: Router,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.dataSource = new MatTableDataSource(this.projects);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.calculateTotalPages();
    this.cdr.detectChanges();
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
    this.router.navigate(['dashboard/project/details', project.id]);
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
}
