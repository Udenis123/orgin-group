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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';

export interface AppointmentData {
  id: string;
  clientName: string;
  date: string;
  time: string;
  status: string;
}

@Component({
  selector: 'app-scheduled-appointments',
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
    RouterModule
  ],
  templateUrl: './scheduled-appointments.component.html',
  styleUrl: './scheduled-appointments.component.scss'
})
export class ScheduledAppointmentsComponent implements AfterViewInit {
  dataSource: MatTableDataSource<AppointmentData>;
  displayedColumns: string[] = ['no', 'clientName', 'date', 'time', 'status', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];
  pageSize = this.pageSizeOptions[0];
  totalPages = 0;

  appointments: AppointmentData[] = [
    { 
      id: '1', 
      clientName: 'John Doe', 
      date: '2023-11-15', 
      time: '10:00 AM', 
      status: 'confirmed' 
    },
    { 
      id: '3', 
      clientName: 'Jane Smith', 
      date: '2023-11-16', 
      time: '02:30 PM', 
      status: 'confirmed' 
    },
    { 
      id: '5', 
      clientName: 'Robert Johnson', 
      date: '2023-11-17', 
      time: '04:00 PM', 
      status: 'confirmed' 
    }
  ];

  constructor(
    private cdr: ChangeDetectorRef, 
    private router: Router,
    private translate: TranslateService
  ) {
    const confirmedAppointments = this.appointments.filter(app => app.status === 'confirmed');
    this.dataSource = new MatTableDataSource(confirmedAppointments);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    setTimeout(() => {
      this.calculateTotalPages();
    });
  }

  getTranslatedStatus(status: string): string {
    return this.translate.instant(`appointments.scheduled.status.${status.toLowerCase()}`);
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

  viewAppointment(appointment: AppointmentData) {
    this.router.navigate(['/dashboard/appointments/details', appointment.id]);
  }

  cancelAppointment(appointment: AppointmentData) {
  }
}