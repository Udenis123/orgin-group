import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-basic-checkout',
  templateUrl: './basic-checkout.component.html',
  styleUrls: ['./basic-checkout.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class BasicCheckoutComponent {
  selectedSubscriptionType: string = 'annually';
  selectedPaymentMethod: string = '';
  expiryDate: string = '';
  detectedCardType: string | null = null;

  constructor() { }

  validateExpiryDate(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    
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
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    
    input.value = value;
  }
}
