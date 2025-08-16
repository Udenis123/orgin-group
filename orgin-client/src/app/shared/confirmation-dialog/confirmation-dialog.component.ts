import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button (click)="onNoClick()" class="cancel-button">{{ data.cancelText || 'Cancel' }}</button>
        <button mat-button [mat-dialog-close]="true" cdkFocusInitial class="confirm-button">{{ data.confirmText || 'Confirm' }}</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 24px;
      border-radius: 12px;
      background: white;
      animation: fadeInScale 0.3s ease-out;
    }

    h2 {
      color: #2c3e50;
      margin-bottom: 16px;
    }

    p {
      color: #34495e;
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .cancel-button {
      background-color: #e74c3c;
      color: white;
      padding: 8px 24px;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .cancel-button:hover {
      background-color: #c0392b;
      transform: translateY(-1px);
    }

    .confirm-button {
      background-color: #2ecc71;
      color: white;
      padding: 8px 24px;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .confirm-button:hover {
      background-color: #27ae60;
      transform: translateY(-1px);
    }

    @keyframes fadeInScale {
      0% {
        opacity: 0;
        transform: scale(0.95);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}