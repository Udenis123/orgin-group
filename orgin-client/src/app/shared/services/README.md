# Toast Service Documentation

## Overview
The `ToastService` provides a centralized way to display toast notifications across the application using Angular Material's `MatSnackBar`.

## Usage

### Import the service
```typescript
import { ToastService } from '../../../shared/services/toast.service';
```

### Inject in constructor
```typescript
constructor(private toastService: ToastService) {}
```

### Available Methods

#### showError(message: string, duration?: number)
Displays an error toast notification (red background)
```typescript
this.toastService.showError('An error occurred!', 5000); // 5 seconds
```

#### showSuccess(message: string, duration?: number)
Displays a success toast notification (green background)
```typescript
this.toastService.showSuccess('Operation completed successfully!', 3000); // 3 seconds
```

#### showWarning(message: string, duration?: number)
Displays a warning toast notification (orange background)
```typescript
this.toastService.showWarning('Please check your input!', 4000); // 4 seconds
```

#### showInfo(message: string, duration?: number)
Displays an info toast notification (blue background)
```typescript
this.toastService.showInfo('New updates available!', 3000); // 3 seconds
```

## Default Durations
- Error: 5000ms (5 seconds)
- Success: 3000ms (3 seconds)
- Warning: 4000ms (4 seconds)
- Info: 3000ms (3 seconds)

## Styling
The toast notifications use CSS classes that are defined in `src/styles.scss`:
- `.error-snackbar` - Red background
- `.success-snackbar` - Green background
- `.warning-snackbar` - Orange background
- `.info-snackbar` - Blue background

## Example Implementation
```typescript
import { Component } from '@angular/core';
import { ToastService } from '../../../shared/services/toast.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [MatSnackBarModule], // Required for standalone components
  template: '<button (click)="showMessage()">Show Toast</button>'
})
export class ExampleComponent {
  constructor(private toastService: ToastService) {}

  showMessage() {
    this.toastService.showSuccess('Hello from toast!');
  }

  // Example error handling in HTTP requests
  handleApiError(error: any) {
    this.toastService.showError(error.message || 'An error occurred');
  }
}
```

## Important Notes

### For Standalone Components
If you're using standalone components, make sure to import `MatSnackBarModule`:
```typescript
imports: [MatSnackBarModule, ...otherImports]
```

### Error Handling Best Practices
- Always handle errors in the component that makes the HTTP call
- Extract meaningful error messages from the backend response
- Provide fallback messages for unexpected errors

### Avoiding Dependency Issues
- Don't inject ToastService in services that are used during app initialization
- Handle toast notifications in components rather than in core services
- Use the service for user-facing notifications, not for debugging
