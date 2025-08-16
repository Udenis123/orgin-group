import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';

interface AnalyzerUser {
  id: number;
  name: string;
  nationalId: string;
  phone: string;
  status: 'Active' | 'Terminated';
  [key: string]: any;
}

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
export class AnalyzerComponent {
  currentPage = 0;
  pageSize = 10; // or your preferred default page size
  displayedColumns: string[] = ['no', 'name', 'nationalId', 'phone', 'status', 'actions'];
  analyzerUsers: AnalyzerUser[] = [
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
      status: 'Terminated'
    }
    // Add more users as needed
  ];

  dataSource = new MatTableDataSource(this.analyzerUsers);

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private router: Router) {}

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'name': return item.name.toLowerCase();
        case 'status': return item.status.toLowerCase();
        default: return item[property];
      }
    };
  }

  isTerminated(status: string): boolean {
    return status === 'Terminated';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  viewUserDetails(user: AnalyzerUser) {
    this.router.navigate(['/dashboard/details/users/analyzer', user.id]);
  }

  updateUser(user: AnalyzerUser) {
    this.router.navigate(['/dashboard/update/users/analyzer', user.id]);
  }

  terminateUser(user: AnalyzerUser) {
    // Add your terminate logic here
    console.log('Terminate user:', user);
  }
}
