// src/app/imena-checkout/imena-checkout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { TranslateModule } from '@ngx-translate/core'; // Add this import

@Component({
  selector: 'app-imena-checkout',
  templateUrl: './imena-checkout.component.html',
  styleUrls: ['./imena-checkout.component.scss'],
  standalone: true, // Mark the component as standalone
  imports: [CommonModule, FormsModule, TranslateModule] // Include CommonModule, FormsModule, and TranslateModule in the imports array
})
export class ImenaCheckoutComponent {
  selectedSubscriptionType: string = '';
  selectedPaymentMethod: string = ''; // Initialize with an empty string
  expiryDate: string = '';
  detectedCardType: string | null = null;

  constructor() { }

  validateExpiryDate(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    // Limit to 4 digits
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    
    // Add slash after 2 digits
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    
    // Validate month
    const month = parseInt(value.slice(0, 2));
    if (month < 1 || month > 12) {
      input.classList.add('invalid');
      input.setCustomValidity('Invalid month (01-12)');
    } else {
      input.classList.remove('invalid');
      input.setCustomValidity('');
    }
    
    input.value = value;
  }

  detectCardType(cardNumber: string): string | null {
    const cleanedNumber = cardNumber.replace(/\D/g, '');
    
    if (/^4/.test(cleanedNumber)) {
      return 'visa';
    } else if (/^5[1-5]/.test(cleanedNumber)) {
      return 'mastercard';
    } else if (/^3[47]/.test(cleanedNumber)) {
      return 'amex';
    } else if (/^6(?:011|5)/.test(cleanedNumber)) {
      return 'discover';
    }
    return null;
  }

  validateCardNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 16) {
      value = value.slice(0, 16);
    }
    
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.detectedCardType = this.detectCardType(value);
    
    input.value = value;
  }

  validateCVV(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    // Limit to 3 or 4 digits
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    
    input.value = value;
  }

  // Additional methods can be added here if needed
}