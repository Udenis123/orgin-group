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

export interface IncomingAppointment {
  id: string;
  name: string;
  type: 'virtual' | 'face-to-face';
  date: Date;
  representing: 'Self' | 'individual' | 'company';
  project: string;
}

@Component({
  selector: 'app-incoming-appointments',
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
  templateUrl: './incoming-appointments.component.html',
  styleUrl: './incoming-appointments.component.scss'
})
export class IncomingAppointmentsComponent implements AfterViewInit {
  dataSource: MatTableDataSource<IncomingAppointment>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];
  pageSize = this.pageSizeOptions[0];
  totalPages = 0;

  appointments: IncomingAppointment[] = [
    {
      id: '2',
      name: 'John Doe',
      type: 'virtual',
      date: new Date('2023-10-15'),
      representing: 'individual',
      project: 'Project X'
    },
    {
      id: '4',
      name: 'Jane Smith',
      type: 'face-to-face',
      date: new Date('2023-10-16'),
      representing: 'company',
      project: 'Project Y'
    },
    {
      id: '6',
      name: 'Robert Johnson',
      type: 'virtual',
      date: new Date('2023-10-17'),
      representing: 'individual',
      project: 'Project Z'
    }
  ];

  constructor(
    private cdr: ChangeDetectorRef, 
    private router: Router,
    private translate: TranslateService
  ) {
    this.dataSource = new MatTableDataSource(this.appointments);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    setTimeout(() => {
      this.calculateTotalPages();
    });
  }

  getTranslatedType(type: string): string {
    return this.translate.instant(`appointments.incoming.types.${type}`);
  }

  getTranslatedRepresenting(representing: string): string {
    return this.translate.instant(`appointments.incoming.representing.${representing.toLowerCase()}`);
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

  viewAppointment(appointment: IncomingAppointment) {
    this.router.navigate(['/dashboard/appointments/details', appointment.id]);
  }

  approveAppointment(appointment: IncomingAppointment) {
  }

  declineAppointment(appointment: IncomingAppointment) {
  }
}