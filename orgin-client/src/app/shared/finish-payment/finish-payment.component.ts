import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-finish-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './finish-payment.component.html',
  styleUrls: ['./finish-payment.component.scss']
})
export class FinishPaymentComponent {
  projects = [
    {
      id: '1',
      name: 'Tech Innovation Hub',
      amount: 1500,
      currency: 'USD'
    },
    {
      id: '2',
      name: 'Green Energy Project',
      amount: 2500,
      currency: 'USD'
    }
  ];

  selectedPaymentMethod: string = '';
  selectedProjectId: string | null = null;
  phoneNumber: string = '';
  countryCode: string = '+250';
  cardNumber: string = '';
  expiryDate: string = '';
  cvv: string = '';
  cardHolderName: string = '';
  detectedCardType: string | null = null;

  selectProject(projectId: string) {
    this.selectedProjectId = projectId;
  }

  completePayment() {
    if (this.selectedProjectId && this.selectedPaymentMethod) {
      // Handle payment completion
      console.log('Payment completed for project:', this.selectedProjectId);
      alert('Payment completed successfully!');
    } else {
      alert('Please select a project and payment method');
    }
  }

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
