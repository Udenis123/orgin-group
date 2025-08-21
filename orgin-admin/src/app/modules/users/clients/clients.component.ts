import { Component, ViewChild, AfterViewInit, ChangeDetectorRef, OnInit } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ClientService, Client } from '../../../services/client.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-clients',
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
    MatTooltipModule
  ],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['no', 'name', 'nationalId', 'phone', 'status', 'actions'];
  dataSource: MatTableDataSource<Client>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];
  pageSize = this.pageSizeOptions[0];
  totalPages = 0;
  loading = false;
  error = '';
  processingStatus: { [key: string]: boolean } = {};

  clients: Client[] = [];

  constructor(
    private cdr: ChangeDetectorRef, 
    private router: Router,
    private clientService: ClientService,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Client>([]);
    this.dataSource.sortingDataAccessor = (data, header) => {
      switch (header) {
        case 'status': 
          return data.active ? 'active' : 'disabled'; // Use active field for status
        case 'name':
          return data.name || '';
        case 'nationalId':
          return data.nationalId || '';
        case 'phone':
          return data.phone || '';
        default: 
          return '';
      }
    };
  }

  ngOnInit() {
    this.loadClients();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    setTimeout(() => {
      this.calculateTotalPages();
    });
  }

  loadClients() {
    this.loading = true;
    this.error = '';
    
    this.clientService.getAllClients()
      .pipe(
        catchError(error => {
          console.error('Error loading clients:', error);
          this.error = 'Failed to load clients. Please try again.';
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(clients => {
        this.clients = clients;
        this.dataSource.data = clients;
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

  isDisabled(client: Client): boolean {
    return !client.active; // Use active field to determine if client is disabled
  }

  getClientStatus(client: Client): string {
    return client.active ? 'Active' : 'Disabled';
  }

  isProcessing(clientId: string): boolean {
    return this.processingStatus[clientId] || false;
  }

  viewClientDetails(client: Client) {
    this.router.navigate(['dashboard/details/users/client', client.id]);
  }

  updateClient(client: Client) {
    this.router.navigate(['dashboard/update/users/client', client.id]);
  }

  terminateClient(client: Client) {
    if (this.isProcessing(client.id)) return;
    
    this.processingStatus[client.id] = true;
    
    // Toggle client status (disable)
    this.clientService.toggleClientStatus(client.id)
      .pipe(
        catchError(error => {
          console.error('Error toggling client status:', error);
          this.snackBar.open('Failed to disable client. Please try again.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          return of(null);
        }),
        finalize(() => {
          this.processingStatus[client.id] = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(response => {
        if (response !== null) {
          this.snackBar.open('Client disabled successfully', 'Close', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          // Reload clients to get updated data
          this.loadClients();
        }
      });
  }

  enableClient(client: Client) {
    if (this.isProcessing(client.id)) return;
    
    this.processingStatus[client.id] = true;
    
    // Toggle client status (enable)
    this.clientService.toggleClientStatus(client.id)
      .pipe(
        catchError(error => {
          console.error('Error toggling client status:', error);
          this.snackBar.open('Failed to enable client. Please try again.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          return of(null);
        }),
        finalize(() => {
          this.processingStatus[client.id] = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(response => {
        if (response !== null) {
          this.snackBar.open('Client enabled successfully', 'Close', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          // Reload clients to get updated data
          this.loadClients();
        }
      });
  }
}
