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

export interface Project {
  id: number;
  title: string;
  description: string;
  dateOfSubmission: Date;
  lastUpdated: Date;
  status: 'Approved' | 'Declined' | 'Pending';
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

  projects: Project[] = [
    {
      id: 4,
      title: 'E-commerce Platform',
      description: 'Online marketplace for local artisans',
      dateOfSubmission: new Date('2024-01-20'),
      lastUpdated: new Date('2024-01-25'),
      status: 'Approved'
    },
    {
      id: 5,
      title: 'Mobile Banking App',
      description: 'Secure mobile banking solution',
      dateOfSubmission: new Date('2024-02-10'),
      lastUpdated: new Date('2024-02-15'),
      status: 'Declined'
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
      id: 7,
      title: 'Healthcare Management System',
      description: 'Patient records and appointment management',
      dateOfSubmission: new Date('2024-02-15'),
      lastUpdated: new Date('2024-02-20'),
      status: 'Approved'
    },
    {
      id: 8,
      title: 'Smart Home Automation',
      description: 'IoT-based home control system',
      dateOfSubmission: new Date('2024-03-10'),
      lastUpdated: new Date('2024-03-15'),
      status: 'Pending'
    },
    {
      id: 9,
      title: 'Inventory Management',
      description: 'Real-time stock tracking system',
      dateOfSubmission: new Date('2024-01-25'),
      lastUpdated: new Date('2024-01-30'),
      status: 'Declined'
    },
    {
      id: 10,
      title: 'Social Media Analytics',
      description: 'Data analysis and reporting platform',
      dateOfSubmission: new Date('2024-02-20'),
      lastUpdated: new Date('2024-02-25'),
      status: 'Approved'
    },
    {
      id: 11,
      title: 'Fitness Tracking App',
      description: 'Personal health and workout tracker',
      dateOfSubmission: new Date('2024-03-05'),
      lastUpdated: new Date('2024-03-10'),
      status: 'Pending'
    },
    {
      id: 12,
      title: 'Restaurant Management',
      description: 'Order and table management system',
      dateOfSubmission: new Date('2024-01-30'),
      lastUpdated: new Date('2024-02-05'),
      status: 'Declined'
    }
  ];

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions = [5, 10, 20];

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dataSource.data = this.projects;
    this.calculateTotalPages();
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
    this.router.navigate(['dashboard/project/details', project.id]);
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
}
