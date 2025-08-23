import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container" [class.fullscreen]="fullscreen">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text" *ngIf="message">{{ message }}</div>
        <div class="loading-text" *ngIf="!message">Loading...</div>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      min-height: 200px;
    }

    .loading-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--background-color, #ffffff);
      z-index: 9999;
      min-height: 100vh;
    }

    .loading-spinner {
      text-align: center;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid var(--border-color, #e0e0e0);
      border-top: 4px solid var(--primary-color, #007bff);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    .loading-text {
      color: var(--text-color, #333);
      font-size: 1rem;
      font-weight: 500;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Dark mode support */
    .dark-mode .loading-container.fullscreen {
      background-color: var(--background-color-dark, #1a1a1a);
    }

    .dark-mode .loading-text {
      color: var(--text-color-light, #ffffff);
    }

    .dark-mode .spinner {
      border-color: var(--border-color-dark, #404040);
      border-top-color: var(--primary-color, #007bff);
    }
  `]
})
export class LoadingComponent {
  @Input() message: string = '';
  @Input() fullscreen: boolean = false;
}
