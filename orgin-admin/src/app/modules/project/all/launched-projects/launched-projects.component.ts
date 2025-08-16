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

export interface Project {
  id: number;
  title: string;
  description: string;
  dateOfSubmission: Date;
  lastUpdated: Date;
  status: 'Pending' | 'Approved' | 'Declined';
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
      id: 1,
      title: 'AI Chatbot Platform',
      description: 'An intelligent chatbot solution for businesses',
      dateOfSubmission: new Date('2024-01-10'),
      lastUpdated: new Date('2024-01-15'),
      status: 'Approved'
    },
    {
      id: 2,
      title: 'Eco-Friendly Packaging',
      description: 'Sustainable packaging solutions',
      dateOfSubmission: new Date('2024-01-05'),
      lastUpdated: new Date('2024-01-10'),
      status: 'Declined'
    },
    {
      id: 3,
      title: 'Smart Home Automation',
      description: 'IoT-based home automation system',
      dateOfSubmission: new Date('2024-02-01'),
      lastUpdated: new Date('2024-02-05'),
      status: 'Pending'
    }
  ];

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions = [5, 10, 20];

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService
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
