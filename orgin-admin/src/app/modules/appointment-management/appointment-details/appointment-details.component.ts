import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

export interface AppointmentDetail {
  id: string;
  profilePicture: string;
  name: string;
  email: string;
  phone: string;
  representing: 'company' | 'individual' | 'self';
  companyName: string;
  individualName: string;
  role: string;
  type: 'virtual' | 'face to face';
  preferredLanguage: 'English' | 'French' | 'Kinyarwanda';
  project: string;
  date: string;
  time: string;
  status: 'scheduled' | 'pending';
}

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './appointment-details.component.html',
  styleUrl: './appointment-details.component.scss'
})
export class AppointmentDetailsComponent implements OnInit {
  appointments: AppointmentDetail[] = [
    {
      id: '1',
      profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+250 78 123 4567',
      representing: 'company',
      companyName: 'Tech Solutions Ltd',
      individualName: '',
      role: 'Project Manager',
      type: 'virtual',
      preferredLanguage: 'English',
      project: 'E-commerce Platform',
      date: '2023-11-15',
      time: '14:30',
      status: 'scheduled'
    },
    {
      id: '2',
      profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+250 78 234 5678',
      representing: 'individual',
      companyName: '',
      individualName: 'Jane Smith',
      role: 'UX Designer',
      type: 'face to face',
      preferredLanguage: 'French',
      project: 'Mobile App Redesign',
      date: '2023-11-16',
      time: '10:00',
      status: 'pending'
    },
    {
      id: '3',
      profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg',
      name: 'Robert Johnson',
      email: 'robert.j@example.com',
      phone: '+250 78 345 6789',
      representing: 'company',
      companyName: 'Data Analytics Inc',
      individualName: '',
      role: 'Data Scientist',
      type: 'virtual',
      preferredLanguage: 'English',
      project: 'Customer Insights Dashboard',
      date: '2023-11-17',
      time: '16:45',
      status: 'scheduled'
    },
    {
      id: '4',
      profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg',
      name: 'Emily Davis',
      email: 'emily.d@example.com',
      phone: '+250 78 456 7890',
      representing: 'self',
      companyName: '',
      individualName: '',
      role: 'Freelance Developer',
      type: 'virtual',
      preferredLanguage: 'Kinyarwanda',
      project: 'Website Maintenance',
      date: '2023-11-18',
      time: '09:15',
      status: 'pending'
    },
    {
      id: '5',
      profilePicture: 'https://randomuser.me/api/portraits/men/5.jpg',
      name: 'Michael Brown',
      email: 'michael.b@example.com',
      phone: '+250 78 567 8901',
      representing: 'company',
      companyName: 'Cloud Services Co',
      individualName: '',
      role: 'DevOps Engineer',
      type: 'face to face',
      preferredLanguage: 'English',
      project: 'Server Migration',
      date: '2023-11-19',
      time: '13:30',
      status: 'scheduled'
    },
    {
      id: '6',
      profilePicture: 'https://randomuser.me/api/portraits/women/6.jpg',
      name: 'Sarah Wilson',
      email: 'sarah.w@example.com',
      phone: '+250 78 678 9012',
      representing: 'individual',
      companyName: '',
      individualName: 'Sarah Wilson',
      role: 'Marketing Specialist',
      type: 'virtual',
      preferredLanguage: 'French',
      project: 'Social Media Campaign',
      date: '2023-11-20',
      time: '11:00',
      status: 'pending'
    }
  ];

  currentAppointment: Partial<AppointmentDetail> = {};

  constructor(
    private location: Location, 
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService
  ) {
    // Remove language initialization as it's handled at app level
  }

  ngOnInit() {
    this.route.params.subscribe({
      next: (params) => {
        if (params && params['id']) {
          const id = params['id'];
          const appointment = this.appointments.find(appointment => appointment.id === id);
          this.currentAppointment = appointment || {};
        } else {
          this.currentAppointment = {};
        }
      },
      error: () => {
        this.currentAppointment = {};
      }
    });
  }

  goBack() {
    this.location.back();
  }

  approveAppointment() {
    if (this.currentAppointment.id) {
      this.currentAppointment.status = 'scheduled';
    }
  }

  declineAppointment() {
    if (this.currentAppointment.id) {
      this.currentAppointment.status = 'pending';
    }
  }

  getRepresentingTranslation(representing: string | undefined): string {
    // Don't translate the representing value as it's dynamic data
    return representing || '';
  }

  getTypeTranslation(type: string | undefined): string {
    // Don't translate the type as it's dynamic data
    return type || '';
  }

  getLanguageTranslation(language: string | undefined): string {
    // Don't translate the language as it's dynamic data
    return language || '';
  }

  getStatusTranslation(status: string | undefined): string {
    // Don't translate the status as it's dynamic data
    return status || '';
  }
}