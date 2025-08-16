import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProjectService } from '../../../services/project.services';
import { Project } from '../project.module';

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.scss'],
})
export class MyProjectsComponent implements OnInit {
  launchedProjects: Project[] = [];
  orderedProjects: Project[] = [];
  communityProjects: Project[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    // Check for query params that might indicate a successful update
    this.route.queryParams.subscribe((params) => {
      if (params['updated']) {
        // Handle successful update (e.g., show a success message)
        // You might want to implement a toast/notification service for this
      }
    });

    this.loadUserProjects();
  }

  async loadUserProjects() {
    this.isLoading = true;
    this.error = null;

    try {
      const projects = await this.projectService.getUserProjects();
      this.launchedProjects = projects;
    } catch (error) {
      console.error('Error loading projects:', error);
      this.error = 'Failed to load projects. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }

  editProject(project: Project) {
    if (project.status === 'PENDING' || project.status === 'DECLINED') {
      this.router.navigate([
        'dashboard/project/update/launched',
        project.projectId,
      ]);
    }
  }

  viewProjectDetails(project: Project) {
    this.router.navigate(['dashboard/project/details', project.projectId]);
  }

  // Refresh projects list
  async refreshProjects() {
    await this.loadUserProjects();
  }
}
