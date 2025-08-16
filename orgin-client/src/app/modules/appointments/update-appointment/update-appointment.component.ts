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
import { SchedulingService } from '../../../services/scheduling.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-appointment',
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
  templateUrl: './update-appointment.component.html',
  styleUrls: ['./update-appointment.component.scss']
})
export class UpdateAppointmentComponent implements OnInit {
  appointment: any;
  availableTimes: string[] = [];
  minDate: Date;
  maxDate: Date;
  workingHours = { start: 9, end: 17 };
  disabledDates: Date[] = [];
  bookedDates: Date[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private schedulingService: SchedulingService
  ) {
    const today = new Date();
    this.minDate = new Date(today.setDate(today.getDate() + 1));
    this.maxDate = new Date(today.setMonth(today.getMonth() + 3));
  }

  ngOnInit(): void {
    const appointmentId = this.route.snapshot.paramMap.get('id');
    // Fetch appointment details using the ID
    // For now, using dummy data
    this.appointment = {
      id: appointmentId,
      projectName: 'Sample Project',
      type: 'virtual',
      date: new Date(),
      time: '10:00'
    };
    this.loadAdminSchedule();
  }

  async loadAdminSchedule() {
    // Dummy data for admin schedule
    const today = new Date();
    this.disabledDates = [
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)
    ];
    this.bookedDates = [
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
    ];
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
      this.generateAvailableTimes();
    }
  }

  saveChanges() {
    // Save logic here
    console.log('Appointment updated:', this.appointment);
    this.router.navigate(['/dashboard/appointments']);
  }

  cancel() {
    this.router.navigate(['/dashboard/appointments']);
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
