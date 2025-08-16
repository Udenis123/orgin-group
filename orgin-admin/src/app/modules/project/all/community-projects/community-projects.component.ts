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
  templateUrl: './community-projects.component.html',
  styleUrls: ['./community-projects.component.scss']
})
export class ProjectsCommunityComponent implements OnInit {
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  dataSource = new MatTableDataSource<Project>([]);
  pageSizeOptions = [5, 10, 20];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dataSource.data = this.getDummyData();
    this.calculateTotalPages();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.cdr.detectChanges();
  }

  getDummyData(): Project[] {
    return [
      { id: 1, title: 'Project 1', description: 'Description 1', dateOfSubmission: new Date(), lastUpdated: new Date(), status: 'Approved' },
      { id: 2, title: 'Project 2', description: 'Description 2', dateOfSubmission: new Date(), lastUpdated: new Date(), status: 'Declined' },
      { id: 3, title: 'Project 3', description: 'Description 3', dateOfSubmission: new Date(), lastUpdated: new Date(), status: 'Pending' },
    ];
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

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.calculateTotalPages();
  }
}
