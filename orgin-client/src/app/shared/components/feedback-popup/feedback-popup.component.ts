import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feedback-popup',
  templateUrl: './feedback-popup.component.html',
  styleUrls: ['./feedback-popup.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class FeedbackPopupComponent {
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<{rating: number, feedback: string}>();

  rating: number = 0;
  feedback: string = '';
  submitted: boolean = false;

  setRating(value: number): void {
    this.rating = value;
  }

  onSubmit(): void {
    if (this.rating > 0) {
      this.submit.emit({
        rating: this.rating,
        feedback: this.feedback
      });
      this.submitted = true;
    }
  }

  onClose(): void {
    this.close.emit();
  }
} 