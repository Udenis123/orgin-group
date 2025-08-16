import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DenialReasonDialogComponent } from '../denial-reason-dialog/denial-reason-dialog.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    CommonModule,
    FormsModule,
    TranslateModule,
    MatSortModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements AfterViewInit {
  displayedColumns: string[] = ['no', 'projectName', 'submittedOn', 'submittedBy', 'actions'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];
  pageSize = this.pageSizeOptions[0];
  totalPages = 0;

  // Sample data
  analytics = [
    {
      id: 1,
      projectName: 'Project Alpha',
      submittedOn: '2024-03-15',
      submittedBy: 'John Doe',
      status: 'Pending'
    },
    {
      id: 2,
      projectName: 'Project Beta',
      submittedOn: '2024-03-14',
      submittedBy: 'Jane Smith',
      status: 'Pending'
    }
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.dataSource = new MatTableDataSource(this.analytics);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    setTimeout(() => {
      this.calculateTotalPages();
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.calculateTotalPages();
  }

  previousPage() {
    if (this.currentPage > 0) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) this.currentPage++;
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.dataSource.filteredData.length / this.pageSize);
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

  viewAnalytics(item: any) {
    this.router.navigate(['/dashboard/analytics/details', item.id]);
  }

  approveAnalytics(item: any) {
    // Here you would typically make an API call to approve the project
    // For now, we'll just remove it from the table
    this.removeFromTable(item);
    this.showNotification('analytics.notifications.approved');
  }

  denyAnalytics(item: any) {
    const dialogRef = this.dialog.open(DenialReasonDialogComponent, {
      data: { reason: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Here you would typically make an API call with the denial reason
        console.log('Denial reason:', result);
        this.removeFromTable(item);
        this.showNotification('analytics.notifications.denied');
      }
    });
  }

  private removeFromTable(item: any) {
    const index = this.analytics.findIndex(i => i.id === item.id);
    if (index > -1) {
      this.analytics.splice(index, 1);
      this.dataSource.data = this.analytics;
      this.calculateTotalPages();
      
      // If the current page is now empty and it's not the first page,
      // go to the previous page
      if (this.paginatedData.length === 0 && this.currentPage > 0) {
        this.currentPage--;
      }
      
      this.cdr.detectChanges();
    }
  }

  private showNotification(messageKey: string) {
    this.snackBar.open(
      this.translate.instant(messageKey),
      this.translate.instant('analytics.notifications.close'),
      { duration: 3000 }
    );
  }
}
