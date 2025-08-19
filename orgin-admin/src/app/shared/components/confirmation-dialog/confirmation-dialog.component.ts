import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
  icon?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <div class="confirmation-dialog">
      <div class="dialog-header" [ngClass]="data.type || 'warning'">
        <mat-icon class="header-icon">{{ getIcon() }}</mat-icon>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>
      
      <mat-dialog-content>
        <p class="dialog-message">{{ data.message }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button 
          mat-button 
          (click)="onCancel()"
          class="cancel-btn">
          {{ data.cancelText || 'Cancel' }}
        </button>
                 <button 
           mat-raised-button 
           [color]="getButtonColor()"
           (click)="onConfirm()"
           class="confirm-btn"
           [ngClass]="{'warning': data.type === 'danger'}">
           {{ data.confirmText || 'Confirm' }}
         </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      min-width: 400px;
      max-width: 500px;
      background: var(--primary-color);
      color: white;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px 0;
      margin-bottom: 16px;
      color: white;
    }

    .header-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: white;
    }

    .dialog-header.warning {
      color: white;
    }

    .dialog-header.danger {
      color: white;
    }

    .dialog-header.info {
      color: white;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: white;
    }

    mat-dialog-content {
      padding: 0 24px 16px;
    }

    .dialog-message {
      margin: 0;
      font-size: 16px;
      line-height: 1.5;
      color: white;
    }

    mat-dialog-actions {
      padding: 8px 24px 24px;
      gap: 12px;
    }

    .cancel-btn {
      color: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .cancel-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .confirm-btn {
      font-weight: 500;
      background: var(--secondary-color);
      color: white;
    }

    .confirm-btn:hover {
      background: var(--secondary-color);
      opacity: 0.9;
    }

    .confirm-btn.warning {
      background: var(--warning-color);
      color: white;
    }

    .confirm-btn.warning:hover {
      background: var(--warning-color);
      opacity: 0.9;
    }

    /* Override Material Dialog background */
    ::ng-deep .mat-mdc-dialog-container {
      background: var(--primary-color) !important;
    }

    ::ng-deep .mat-mdc-dialog-surface {
      background: var(--primary-color) !important;
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  getIcon(): string {
    if (this.data.icon) {
      return this.data.icon;
    }
    
    switch (this.data.type) {
      case 'danger':
        return 'warning';
      case 'info':
        return 'info';
      case 'warning':
      default:
        return 'warning';
    }
  }

  getButtonColor(): string {
    switch (this.data.type) {
      case 'danger':
        return 'warn';
      case 'info':
        return 'primary';
      case 'warning':
      default:
        return 'accent';
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
