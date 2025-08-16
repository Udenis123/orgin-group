import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-join-project',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './join-project.component.html',
  styleUrls: ['./join-project.component.scss']
})
export class JoinProjectComponent {
  projectId: string = '';
  isJoined = false;
  
  // Array of sample projects
  projects = [
    {
      id: '2',
      name: 'Eco-Friendly Packaging',
      owner: { name: 'Alice Green', email: 'alice.green@ecopack.com' }
    },
    {
      id: '6',
      name: 'Smart City IoT',
      owner: { name: 'Bob Tech', email: 'bob.tech@smartcity.io' }
    },
    {
      id: '8',
      name: 'AI Healthcare',
      owner: { name: 'Dr. Clara Health', email: 'clara.health@aihealth.org' }
    },
    {
      id: '12',
      name: 'Renewable Energy Grid',
      owner: { name: 'David Power', email: 'david.power@renewgrid.com' }
    }
  ];

  // Current project data
  projectName: string = '';
  projectOwner: { name: string, email: string } = { name: '', email: '' };

  constructor(private route: ActivatedRoute, private dialog: MatDialog) {
    const id = this.route.snapshot.paramMap.get('id') || '';
    const project = this.projects.find(p => p.id === id);
    
    if (project) {
      this.projectId = project.id;
      this.projectName = project.name;
      this.projectOwner = project.owner;
      // Trigger the dialog immediately after setting project data
      this.joinProject();
    }
  }

  joinProject() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Join Project',
        message: `Are you sure you want to join ${this.projectName}?`,
        confirmText: 'Join',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Simulate joining project with a 1 second delay
        setTimeout(() => {
          this.isJoined = true;
        }, 1000);
      }
    });
  }
}
