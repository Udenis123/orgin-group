import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-community-project-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community-project-details.component.html',
  styleUrl: './community-project-details.component.scss'
})
export class CommunityProjectDetailsComponent {
  projectDetails: any[] = [];
  isApproved = false;

  approveProject(): void {
    this.isApproved = true;
    // Add any additional approval logic here
  }
}
