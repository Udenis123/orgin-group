import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SchedulingService } from '../../services/scheduling.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

export interface Appointment {
  id: string;
  projectId: string;
  projectName: string;
  actionType: 'invest' | 'buy';
  type: 'virtual' | 'face-to-face';
  date: Date;
  time: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
}

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {
  displayedColumns: string[] = ['project', 'type', 'date', 'time', 'status', 'actions'];
  dataSource: Appointment[] = [];

  constructor(
    private schedulingService: SchedulingService,
    private dialog: MatDialog,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.startCompletionCheck();
  }

  async loadAppointments() {
    // Use current date for testing
    const today = new Date();
    const tomorrow = new Date(today.setDate(today.getDate() + 1));
    const yesterday = new Date(today.setDate(today.getDate() - 2));

    const dummyAppointments: Appointment[] = [
      {
        id: '358a02eb-f83f-4334-af4a-97f867320b6d',
        projectId: '358a02eb-f83f-4334-af4a-97f867320b6d',
        projectName: 'Tech Innovation Hub',
        actionType: 'invest',
        type: 'virtual',
        date: yesterday,
        time: '10:00',
        status: this.getInitialStatus(yesterday, '10:00')
      },
      {
        id: '2',
        projectId: '2',
        projectName: 'Green Energy Project',
        actionType: 'buy',
        type: 'face-to-face',
        date: tomorrow,
        time: '14:30',
        status: this.getInitialStatus(tomorrow, '14:30')
      },
      {
        id: '3',
        projectId: '3',
        projectName: 'Agro Processing Plant',
        actionType: 'invest',
        type: 'virtual',
        date: yesterday,
        time: '14:00',
        status: 'cancelled' // Explicitly set as cancelled
      },
      {
        id: '4',
        projectId: '4',
        projectName: 'Urban Development Project',
        actionType: 'buy',
        type: 'face-to-face',
        date: tomorrow,
        time: '11:00',
        status: 'pending' // Explicitly set as pending
      }
    ];
    this.dataSource = dummyAppointments;
  }

  private getInitialStatus(date: Date, time: string): 'scheduled' | 'completed' {
    const appointmentDateTime = new Date(
      `${date.toISOString().split('T')[0]}T${time}:00`
    );
    const oneHourAfter = new Date(appointmentDateTime.getTime() + 60 * 60 * 1000);
    
    return new Date() >= oneHourAfter ? 'completed' : 'scheduled';
  }

  cancelAppointment(appointment: Appointment) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('appointments.cancel'),
        message: this.translate.instant('appointments.confirmCancel')
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the appointment status
        appointment.status = 'cancelled';
        // In a real app, you would call the API to update the appointment
        console.log('Appointment cancelled:', appointment);
      }
    });
  }

  updateAppointment(appointment: Appointment) {
    this.router.navigate(['/dashboard/appointments/update', appointment.id]);
  }

  startCompletionCheck() {
    setInterval(() => {
      this.dataSource = this.dataSource.map(appointment => {
        // Skip if appointment is cancelled
        if (appointment.status === 'cancelled') {
          return appointment;
        }

        const appointmentDateTime = new Date(
          `${appointment.date.toISOString().split('T')[0]}T${appointment.time}:00`
        );
        const oneHourAfter = new Date(appointmentDateTime.getTime() + 60 * 60 * 1000);
        
        if (new Date() >= oneHourAfter && appointment.status === 'scheduled') {
          return { ...appointment, status: 'completed' };
        }
        return appointment;
      });
    }, 60000); // Check every minute
  }
}
