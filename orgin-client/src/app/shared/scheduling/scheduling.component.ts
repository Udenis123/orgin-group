import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { SchedulingService } from '../../services/scheduling.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Appointment {
  type: 'virtual' | 'face-to-face';
  date: Date | null;
  time: string | null;
  representing: 'self' | 'individual' | 'company';
  individualName: string | null;
  companyName: string | null;
  role: string | null;
  language: 'english' | 'french' | 'kinyarwanda';
}

@Component({
  selector: 'app-scheduling',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './scheduling.component.html',
  styleUrls: ['./scheduling.component.scss']
})
export class SchedulingComponent implements OnInit {
  projectId: string | null = null;
  actionType: 'invest' | 'buy' | null = null;
  appointment: Appointment = {
    type: 'virtual',
    date: null,
    time: null,
    representing: 'self',
    individualName: null,
    companyName: null,
    role: null,
    language: 'english'
  };
  availableTimes: string[] = [];
  minDate: Date;
  maxDate: Date;
  workingHours = { start: 9, end: 17 }; // Example working hours
  disabledDates: Date[] = []; // Dates when admin is unavailable
  bookedDates: Date[] = []; // Dates already booked by other clients
  projectName: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private schedulingService: SchedulingService,
    public translate: TranslateService
  ) {
    const today = new Date();
    this.minDate = new Date(today.setDate(today.getDate() + 1)); // Tomorrow
    this.maxDate = new Date(today.setMonth(today.getMonth() + 3)); // 3 months from now
  }

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('id');
      this.actionType = params.get('type') as 'invest' | 'buy';
      
      if (!this.projectId || !this.actionType) {
        this.router.navigate(['/dashboard']);
      } else {
        this.loadProjectDetails();
      }
    });

    this.loadAdminSchedule();
  }

  async loadProjectDetails() {
    // Dummy data for project details
    const dummyProjects = [
      { id: '358a02eb-f83f-4334-af4a-97f867320b6d', name: 'Tech Innovation Hub' },
      { id: '2', name: 'Green Energy Project' },
      { id: '3', name: 'Agro Processing Plant' }
    ];

    const project = dummyProjects.find(p => p.id === this.projectId);
    if (project) {
      this.projectName = project.name;
    }
  }

  async loadAdminSchedule() {
    // Dummy data for admin schedule
    const today = new Date();
    const dummySchedule = {
      busyDates: [
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)
      ],
      bookedDates: [
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
      ]
    };

    this.disabledDates = dummySchedule.busyDates;
    this.bookedDates = dummySchedule.bookedDates;
    this.generateAvailableTimes();
  }

  generateAvailableTimes() {
    const times = [];
    for (let hour = this.workingHours.start; hour < this.workingHours.end; hour++) {
      times.push(`${hour}:00`, `${hour}:30`);
    }
    this.availableTimes = times;
  }

  onDateChange(selectedDate: Date | null) {
    if (selectedDate) {
      // Filter times based on admin's availability for selected date
      this.generateAvailableTimes();
    }
  }

  confirmSchedule() {
    if (!this.appointment.date || !this.appointment.time) {
      alert(this.translate.instant('scheduling.error'));
      return;
    }

    // Dummy success response
    console.log('Appointment scheduled successfully:', {
      projectId: this.projectId,
      actionType: this.actionType,
      ...this.appointment
    });

    // Show success message and navigate to dashboard
    alert(this.translate.instant('scheduling.success'));
    this.router.navigate(['/dashboard']);
  }

  cancel() {
    this.router.navigate(['/dashboard']);
  }

  skipScheduling() {
    this.router.navigate(['/dashboard/finish-payment'], {
      queryParams: {
        projectId: this.projectId,
        actionType: this.actionType
      }
    });
  }

  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    
    // Exclude weekends
    const day = date.getDay();
    if (day === 0 || day === 6) return false; // Sunday = 0, Saturday = 6
    
    // Rwanda public holidays
    const holidays = [
      new Date(date.getFullYear(), 0, 1),   // New Year's Day
      new Date(date.getFullYear(), 1, 1),   // Heroes' Day
      new Date(date.getFullYear(), 1, 2),   // Heroes' Day
      new Date(date.getFullYear(), 3, 7),   // Genocide Memorial Day
      new Date(date.getFullYear(), 4, 1),   // Labour Day
      new Date(date.getFullYear(), 6, 1),   // Independence Day
      new Date(date.getFullYear(), 6, 4),   // Liberation Day
      new Date(date.getFullYear(), 7, 15),  // Assumption Day
      new Date(date.getFullYear(), 11, 25), // Christmas Day
      new Date(date.getFullYear(), 11, 26)  // Boxing Day
    ];
    
    const isHoliday = holidays.some(holiday => 
      holiday.getFullYear() === date.getFullYear() &&
      holiday.getMonth() === date.getMonth() &&
      holiday.getDate() === date.getDate()
    );
    
    // Exclude if it's a holiday, admin is busy, or already booked
    return !isHoliday && 
           !this.disabledDates.some(disabledDate => 
             disabledDate.getTime() === date.getTime()
           ) &&
           !this.bookedDates.some(bookedDate => 
             bookedDate.getTime() === date.getTime()
           );
  }
}
