import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RatingsService, Rating } from '../../services/ratings.service';

interface Feedback {
  feedbackId: string;
  clientName: string;
  email: string;
  rating: number;
  submittedOn: string;
  profilePicture: string;
  subscriptionStatus: string;
  subscriptionType: string;
  feedbackMessage: string;
}

@Component({
  selector: 'app-feedback-details',
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule, 
    MatProgressSpinnerModule, 
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './feedback-details.component.html',
  styleUrl: './feedback-details.component.scss'
})
export class FeedbackDetailsComponent implements OnInit {
  feedback: Feedback | undefined;
  loading = false;
  error = false;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private ratingsService: RatingsService
  ) {}

  ngOnInit() {
    const feedbackId = this.route.snapshot.paramMap.get('id');
    
    if (feedbackId) {
      this.loadFeedbackFromAPI(feedbackId);
    } else {
      this.error = true;
      console.error('No feedback ID provided.');
    }
  }

  private loadFeedbackFromAPI(feedbackId: string) {
    this.loading = true;
    this.error = false;
    
    // Fetch all ratings and find the specific one
    this.ratingsService.getRatings().subscribe({
      next: (ratings: Rating[]) => {
        const rating = ratings.find(r => r.id.toString() === feedbackId);
        
        if (rating) {
          // Map API response to Feedback interface
          this.feedback = {
            feedbackId: rating.id.toString(),
            clientName: rating.userName,
            email: this.generateDummyEmail(rating.userName),
            rating: rating.starNumber,
            submittedOn: this.generateDummyDate(),
            profilePicture: rating.userPhoto,
            subscriptionStatus: this.generateDummySubscriptionStatus(),
            subscriptionType: this.generateDummySubscriptionType(),
            feedbackMessage: rating.message
          };
        } else {
          this.error = true;
          console.error('Feedback not found in API response.');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading feedback from API:', error);
        this.loading = false;
        this.error = true;
      }
    });
  }

  getTranslatedStatus(status: string): string {
    const key = status.toLowerCase();
    return this.translate.instant(`feedback.details.statuses.${key}`);
  }

  getTranslatedSubscriptionType(type: string): string {
    const key = type.toLowerCase();
    return this.translate.instant(`feedback.details.subscriptionTypes.${key}`);
  }

  goBack() {
    this.router.navigate(['/dashboard/feedback-approval']);
  }

  private generateDummyEmail(userName: string): string {
    // Generate a dummy email based on the user name
    const cleanName = userName.toLowerCase().replace(/\s+/g, '.');
    return `${cleanName}@example.com`;
  }

  private generateDummyDate(): string {
    // Generate a date within the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
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
} 