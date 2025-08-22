import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookmarkedService } from '../../services/bookmarked.service';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-bookmarking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bookmarking-container">
      <div class="bookmarking-content">
        <div class="spinner" *ngIf="isLoading">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div class="message" *ngIf="!isLoading">
          <h3>{{ message }}</h3>
          <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./bookmarking.component.scss']
})
export class BookmarkingComponent implements OnInit, OnDestroy {
  isLoading = true;
  message = 'Processing bookmark...';
  errorMessage = '';
  private timeoutId: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookmarkedService: BookmarkedService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.processBookmark();
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  private processBookmark(): void {
    // Get project ID from route
    const projectId = this.route.snapshot.paramMap.get('id');
    
    if (!projectId) {
      this.showError('Project ID not found');
      return;
    }

    // Get user credentials from cookies
    const userId = this.cookieService.get('userId');
    const token = this.cookieService.get('token');

    if (!userId || !token) {
      this.showError('User not authenticated. Please login first.');
      return;
    }

    // Call bookmark service
    this.bookmarkedService.bookmarkProject(userId, projectId).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Bookmark success response:', response);
        
        // The service now returns ApiResponse format directly
        this.message = response.message || 'Project has been successfully bookmarked!';
        
        // Close tab after showing success message for 2 seconds
        this.timeoutId = setTimeout(() => {
          this.closeTab();
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.log('Bookmark error response:', error);
        
        // Check if it's actually a success (status 200) but treated as error
        if (error.status === 200) {
          // This is actually a success case - backend returned 200 but with parsing error
          this.message = 'Project has been successfully bookmarked!';
          console.log('Treating status 200 error as success');
          
          // Close tab after showing success message for 2 seconds
          this.timeoutId = setTimeout(() => {
            this.closeTab();
          }, 2000);
        } else {
          // Use backend error message for actual errors
          this.showError(error.message || 'Failed to bookmark project');
        }
      }
    });
  }

  private showError(errorMsg: string): void {
    this.isLoading = false;
    this.message = 'Bookmarking failed';
    this.errorMessage = errorMsg;
    console.log('Showing error:', errorMsg);
    
    // Close tab after showing error for 3 seconds
    this.timeoutId = setTimeout(() => {
      this.closeTab();
    }, 3000);
  }

  private closeTab(): void {
    // Close the current tab/window
    window.close();
    
    // Fallback: if window.close() doesn't work, redirect to a safe page
    setTimeout(() => {
      if (!window.closed) {
        window.location.href = environment.webUrl || 'http://localhost:4200';
      }
    }, 1000);
  }
}
