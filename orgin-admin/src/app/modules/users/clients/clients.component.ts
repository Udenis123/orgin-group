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
export class ClientsComponent implements AfterViewInit {
  displayedColumns: string[] = ['no', 'name', 'nationalId', 'phone', 'status', 'actions'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];
  pageSize = this.pageSizeOptions[0];
  totalPages = 0;

  clients = [
    { 
      id: 1,
      name: 'John Doe', 
      nationalId: '123456789', 
      phone: '0712345678',
      status: 'Active'
    },
    { 
      id: 2,
      name: 'Jane Smith', 
      nationalId: '987654321', 
      phone: '0723456789',
      status: 'Disabled'
    },
    // ... more clients
  ];

  constructor(private cdr: ChangeDetectorRef, private router: Router) {
    this.dataSource = new MatTableDataSource(this.clients);
    this.dataSource.sortingDataAccessor = (data, header) => {
      switch (header) {
        case 'status': 
          return data.status.toLowerCase(); // Make sorting case-insensitive
        default: 
          return data[header];
      }
    };
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

  isDisabled(status: string): boolean {
    return status === 'Disabled';
  }

  viewClientDetails(client: any) {
    this.router.navigate(['dashboard/details/users/client', client.id]);
  }

  updateClient(client: any) {
    this.router.navigate(['dashboard/update/users/client', client.id]);
  }

  terminateClient(client: any) {
    // Add your terminate logic here
    console.log('Terminate client:', client);
  }

  enableClient(client: any) {
    // Add your enable logic here
    console.log('Enable client:', client);
    client.status = 'Active';
  }
}
