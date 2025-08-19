import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AnalyzerService, Analyzer } from '../../../services/analyzer.service';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-analyzer',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './analyzer.component.html',
  styleUrl: './analyzer.component.scss'
})
export class AnalyzerComponent implements OnInit {
  currentPage = 0;
  pageSize = 10;
  displayedColumns: string[] = ['no', 'name', 'nationalId', 'phone', 'status', 'actions'];
  analyzerUsers: Analyzer[] = [];
  dataSource = new MatTableDataSource<Analyzer>([]);
  isLoading = true;
  error = false;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private analyzerService: AnalyzerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAnalyzers();
  }

  loadAnalyzers(): void {
    this.isLoading = true;
    this.error = false;

    this.analyzerService.getAnalyzers().subscribe({
      next: (analyzers) => {
        this.analyzerUsers = analyzers;
        this.dataSource.data = this.analyzerUsers;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading analyzers:', error);
        this.error = true;
        this.isLoading = false;
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'name': return item.name.toLowerCase();
        case 'status': return item.enabled ? 'active' : 'terminated';
        default: return (item as any)[property];
      }
    };
  }

  getStatusText(enabled: boolean): string {
    return enabled ? 'Active' : 'Terminated';
  }

  isTerminated(enabled: boolean): boolean {
    return !enabled;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  viewUserDetails(user: Analyzer) {
    this.router.navigate(['/dashboard/details/users/analyzer', user.id]);
  }

  updateUser(user: Analyzer) {
    this.router.navigate(['/dashboard/update/users/analyzer', user.id]);
  }

  terminateUser(user: Analyzer) {
    const dialogData: ConfirmationDialogData = {
      title: user.enabled ? 'Terminate Analyzer' : 'Enable Analyzer',
      message: `Are you sure you want to ${user.enabled ? 'terminate' : 'enable'} ${user.name}?`,
      confirmText: user.enabled ? 'Terminate' : 'Enable',
      cancelText: 'Cancel',
      type: user.enabled ? 'danger' : 'info',
      icon: user.enabled ? 'warning' : 'check_circle'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogData,
      width: '450px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.analyzerService.toggleAnalyzerStatus(user.id).subscribe({
          next: (response) => {
            console.log('Analyzer status updated successfully:', response);
            this.loadAnalyzers();
            this.showNotification(
              user.enabled ? 'Analyzer terminated successfully' : 'Analyzer enabled successfully',
              'success'
            );
          },
          error: (error) => {
            console.error('Error updating analyzer status:', error);
            this.showNotification('Error updating analyzer status. Please try again.', 'error');
          }
        });
      }
    });
  }

  private showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
}
