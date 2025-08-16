import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface ClientDetails {
  id: string;
  fullName: string;
  nationalId: string;
  nationality: string;
  email: string;
  phoneNumber: string;
  profession: string;
  subscriptionPlan: 'Free' | 'Basic' | 'Premium' | 'Imena';
  subscriptionStatus: 'ACTIVE' | 'EXPIRED';
  accountStatus: 'ACTIVE' | 'DISABLED';
}

interface ClientInteractions {
  projectsLaunched: number;
  projectsOrdered: number;
  projectsJoined: number;
  communityProjects: number;
  projectsDeclined: number;
  projectsPending: number;
  projectsInvested: number;
  projectsBought: number;
}

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './client-details.component.html',
  styleUrl: './client-details.component.scss'
})
export class ClientDetailsComponent implements OnInit {
  clientId: string | null = null;
  clientDetails: ClientDetails | null = null;
  clientInteractions: ClientInteractions = {
    projectsLaunched: 0,
    projectsOrdered: 0,
    projectsJoined: 0,
    communityProjects: 0,
    projectsDeclined: 0,
    projectsPending: 0,
    projectsInvested: 0,
    projectsBought: 0
  };

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('id');
    this.loadClientDetails();
    this.loadClientInteractions();
  }

  loadClientDetails(): void {
    // Dummy data for testing
    const dummyData: ClientDetails[] = [
      {
        id: '1',
        fullName: 'John Client',
        nationalId: '123456789',
        nationality: 'Kenyan',
        email: 'john.client@example.com',
        phoneNumber: '712345678',
        profession: 'Software Engineer',
        subscriptionPlan: 'Premium',
        subscriptionStatus: 'ACTIVE',
        accountStatus: 'ACTIVE'
      },
      {
        id: '2',
        fullName: 'Jane Client',
        nationalId: '987654321',
        nationality: 'Ugandan',
        email: 'jane.client@example.com',
        phoneNumber: '712345679',
        profession: 'Data Analyst',
        subscriptionPlan: 'Basic',
        subscriptionStatus: 'EXPIRED',
        accountStatus: 'DISABLED'
      }
    ];

    this.clientDetails = dummyData.find(data => data.id === this.clientId) || null;
  }

  loadClientInteractions(): void {
    // Dummy data for testing
    const dummyInteractions = [
      {
        id: '1',
        projectsLaunched: 5,
        projectsOrdered: 10,
        projectsJoined: 3,
        communityProjects: 2,
        projectsDeclined: 1,
        projectsPending: 2,
        projectsInvested: 3,
        projectsBought: 4
      },
      {
        id: '2',
        projectsLaunched: 2,
        projectsOrdered: 5,
        projectsJoined: 1,
        communityProjects: 1,
        projectsDeclined: 0,
        projectsPending: 1,
        projectsInvested: 2,
        projectsBought: 3
      }
    ];

    const interactions = dummyInteractions.find(data => data.id === this.clientId);
    this.clientInteractions = interactions || {
      projectsLaunched: 0,
      projectsOrdered: 0,
      projectsJoined: 0,
      communityProjects: 0,
      projectsDeclined: 0,
      projectsPending: 0,
      projectsInvested: 0,
      projectsBought: 0
    };
  }

  goBack(): void {
    this.router.navigate(['/dashboard/users/all/clients']);
  }
}
