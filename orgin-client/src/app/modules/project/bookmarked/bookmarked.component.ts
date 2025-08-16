import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import {
  BookmarkedService,
  BookmarkedProject,
} from '../../../services/bookmarked.service';
import { CookieService } from 'ngx-cookie-service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-bookmarked',
  templateUrl: './bookmarked.component.html',
  styleUrl: './bookmarked.component.scss',
  imports: [
    CommonModule,
    DatePipe,
    MatDialogModule,
    MatSnackBarModule,
    TranslateModule,
  ],
  standalone: true,
})
export class BookmarkedComponent implements OnInit {
  projects: BookmarkedProject[] = [];
  userId: string = '';
  isLoading: boolean = false;

  constructor(
    private bookmarkedService: BookmarkedService,
    private snackBar: MatSnackBar,
    private cookieService: CookieService,
    public translate: TranslateService,
    private router: Router
  ) {
    this.userId = this.cookieService.get('userId');
  }

  ngOnInit() {
    if (!this.userId) {
      this.showMessage('User not authenticated');
      return;
    }
    this.loadBookmarkedProjects();
  }

  private showMessage(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Close', { duration });
  }

  loadBookmarkedProjects() {
    this.isLoading = true;
    this.bookmarkedService
      .getBookmarkedProjects(this.userId)
      .pipe(
        catchError((error) => {
          this.showMessage(
            error.message || 'Error loading bookmarked projects'
          );
          return of([]);
        })
      )
      .subscribe({
        next: (projects) => {
          this.projects = projects;
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  viewAnalytics(projectId: string) {
    console.log('Navigating to analytics for project ID:', projectId);
    this.router.navigate(['/dashboard/analytics', projectId]);
  }

  removeBookmark(projectId: string) {
    this.bookmarkedService
      .removeBookmark(this.userId, projectId)
      .pipe(
        catchError((error) => {
          this.showMessage(error.message || 'Error removing bookmark');
          return of(null);
        })
      )
      .subscribe({
        next: () => {
          this.showMessage('Bookmark removed successfully');
          this.loadBookmarkedProjects();
        },
      });
  }
}
