import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ordered-project-details',
  templateUrl: './ordered-project-details.component.html',
  styleUrls: ['./ordered-project-details.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class OrderedProjectDetailsComponent implements OnInit {
  projectId!: number;
  projectDetails: any[] = [];
  isCompleted = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.projectId = +this.route.snapshot.paramMap.get('id')!;
    this.loadProjectDetails();
  }

  loadProjectDetails(): void {
    // Dummy ordered project data
    this.projectDetails = [
      { label: 'Project Name', value: 'Eco-Friendly Packaging' },
      { label: 'Category', value: 'Sustainability' },
      { label: 'Description', value: 'Innovative packaging solutions using biodegradable materials' },
      { label: 'Status', value: 'In Progress' },
      { label: 'Start Date', value: '2024-01-01' },
      { label: 'Deadline', value: '2024-06-30' },
      { label: 'Budget', value: '$50,000' },
      { label: 'Client', value: 'Green Solutions Inc.' },
      { label: 'Project Manager', value: 'Sarah Johnson' },
      { label: 'Team Members', value: '5' },
      { label: 'Progress', value: '65%' }
    ];

    // Dummy completion status
    this.isCompleted = false;
  }

  markAsCompleted(): void {
    this.isCompleted = true;
    console.log('Project marked as completed');
  }
}
