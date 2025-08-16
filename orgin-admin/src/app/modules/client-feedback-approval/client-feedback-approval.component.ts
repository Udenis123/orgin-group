import { Component, ViewChild, AfterViewInit, ChangeDetectorRef, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RatingsService, Rating } from '../../services/ratings.service';

interface Feedback {
  feedbackId: string;
  clientName: string;
  rating: number;
  submittedOn: string;
  profilePicture: string;
  subscriptionStatus: string;
  subscriptionType: string;
  feedbackMessage: string;
  isApproving?: boolean;
  isDeclining?: boolean;
}

@Component({
  selector: 'app-client-feedback-approval',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    CommonModule,
    FormsModule,
    TranslateModule,
    MatSortModule,
    MatTooltipModule,
    MatOptionModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './client-feedback-approval.component.html',
  styleUrl: './client-feedback-approval.component.scss'
})
export class ClientFeedbackApprovalComponent implements OnInit, AfterViewInit {
  dataSource: MatTableDataSource<Feedback>;
  displayedColumns: string[] = ['no', 'name', 'rating', 'submittedOn', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];
  pageSize = this.pageSizeOptions[0];
  totalPages = 0;
  loading = false;

  feedbackList: Feedback[] = [];

  constructor(
    private cdr: ChangeDetectorRef, 
    private router: Router,
    private translate: TranslateService,
    private ratingsService: RatingsService
  ) {
    this.dataSource = new MatTableDataSource(this.feedbackList);
  }

  ngOnInit() {
    this.loadRatings();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    setTimeout(() => {
      this.calculateTotalPages();
    });
  }

  loadRatings() {
    this.loading = true;
    this.ratingsService.getRatings().subscribe({
      next: (ratings: Rating[]) => {
        // Map API response to Feedback interface with dummy data for missing fields
        this.feedbackList = ratings.map((rating, index) => ({
          feedbackId: rating.id.toString(),
          clientName: rating.userName,
          rating: rating.starNumber,
          submittedOn: this.generateDummyDate(index), // Dummy date since not in API
          profilePicture: rating.userPhoto,
          subscriptionStatus: this.generateDummySubscriptionStatus(), // Dummy data
          subscriptionType: this.generateDummySubscriptionType(), // Dummy data
          feedbackMessage: rating.message
        }));
        
        this.dataSource.data = this.feedbackList;
        this.calculateTotalPages();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading ratings:', error);
        this.loading = false;
        // Fallback to dummy data if API fails
        this.loadDummyData();
      }
    });
  }

  private generateDummyDate(index: number): string {
    // Generate dates within the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - (index * 2 + 1));
    return date.toISOString().split('T')[0];
  }

  private generateDummySubscriptionStatus(): string {
    const statuses = ['Active', 'Inactive', 'Pending'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private generateDummySubscriptionType(): string {
    const types = ['Basic', 'Premium', 'Enterprise'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private loadDummyData() {
    this.feedbackList = [
      { feedbackId: '1', clientName: 'Client 1', rating: 4, submittedOn: '2023-10-01', profilePicture: '', subscriptionStatus: 'Active', subscriptionType: 'Basic', feedbackMessage: 'Great service!' },
      { feedbackId: '2', clientName: 'Client 2', rating: 5, submittedOn: '2023-10-02', profilePicture: '', subscriptionStatus: 'Active', subscriptionType: 'Premium', feedbackMessage: 'Excellent experience!' },
      { feedbackId: '3', clientName: 'Client 3', rating: 3, submittedOn: '2023-10-03', profilePicture: '', subscriptionStatus: 'Inactive', subscriptionType: 'Basic', feedbackMessage: 'Good but could be better.' },
    ];
    this.dataSource.data = this.feedbackList;
    this.calculateTotalPages();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.calculateTotalPages();
  }

  previousPage() {
    if (this.currentPage > 0) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) this.currentPage++;
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.dataSource.filteredData.length / this.pageSize);
  }

  get paginatedData() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.dataSource.filteredData.slice(start, end);
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.calculateTotalPages();
  }

  viewFeedback(feedback: Feedback) {
    this.router.navigate(['/dashboard/feedback-details', feedback.feedbackId]);
  }

  approveFeedback(feedback: Feedback) {
    const ratingId = parseInt(feedback.feedbackId);
    
    // Add loading state to the specific button
    feedback.isApproving = true;
    
    this.ratingsService.approveRating(ratingId).subscribe({
      next: (response) => {
        console.log('Feedback approved:', feedback);
        feedback.isApproving = false;
        // Reload the data to reflect changes
        this.loadRatings();
      },
      error: (error) => {
        console.error('Error approving feedback:', error);
        feedback.isApproving = false;
      }
    });
  }

  declineFeedback(feedback: Feedback) {
    const ratingId = parseInt(feedback.feedbackId);
    
    // Add loading state to the specific button
    feedback.isDeclining = true;
    
    this.ratingsService.declineRating(ratingId).subscribe({
      next: (response) => {
        console.log('Feedback declined:', feedback);
        feedback.isDeclining = false;
        // Reload the data to reflect changes
        this.loadRatings();
      },
      error: (error) => {
        console.error('Error declining feedback:', error);
        feedback.isDeclining = false;
      }
    });
  }
}
