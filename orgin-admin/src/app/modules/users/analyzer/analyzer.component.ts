import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AnalyzerService, Analyzer } from '../../../services/analyzer.service';

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
    MatTooltipModule
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
    private analyzerService: AnalyzerService
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
    // Add your terminate logic here
    console.log('Terminate user:', user);
  }
}
