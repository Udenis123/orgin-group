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
  templateUrl: './community-projects.component.html',
  styleUrls: ['./community-projects.component.scss']
})
export class SubmittedCommunityProjectsComponent {
  displayedColumns: string[] = ['number', 'title', 'description', 'dateOfSubmission', 'lastUpdated', 'status', 'actions'];
  dataSource: MatTableDataSource<Project>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  projects: Project[] = [
    {
      id: 7,
      title: 'Community Garden',
      description: 'Urban gardening initiative',
      dateOfSubmission: new Date('2024-01-15'),
      lastUpdated: new Date('2024-01-20'),
      status: 'Pending'
    },
    {
      id: 8,
      title: 'Recycling Program',
      description: 'Community-based recycling initiative',
      dateOfSubmission: new Date('2024-02-05'),
      lastUpdated: new Date('2024-02-10'),
      status: 'Pending'
    },
    {
      id: 9,
      title: 'Neighborhood Watch App',
      description: 'Safety app for local communities',
      dateOfSubmission: new Date('2024-03-10'),
      lastUpdated: new Date('2024-03-15'),
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
    this.router.navigate(['dashboard/project/details', project.id]);
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.calculateTotalPages();
  }
}
