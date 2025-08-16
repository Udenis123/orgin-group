import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-denial-reason-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ 'analytics.denial.title' | translate }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="fill" style="width: 100%;">
        <mat-label>{{ 'analytics.denial.reason' | translate }}</mat-label>
        <textarea 
          matInput 
          [(ngModel)]="data.reason" 
          required 
          rows="4"
          placeholder="{{ 'analytics.denial.placeholder' | translate }}">
        </textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        {{ 'common.cancel' | translate }}
      </button>
      <button 
        mat-raised-button 
        color="warn" 
        [disabled]="!data.reason"
        (click)="onConfirm()">
        {{ 'common.confirm' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
    }
    mat-form-field {
      margin-top: 16px;
    }
  `]
})
export class DenialReasonDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DenialReasonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reason: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.data.reason) {
      this.dialogRef.close(this.data.reason);
    }
  }
} 