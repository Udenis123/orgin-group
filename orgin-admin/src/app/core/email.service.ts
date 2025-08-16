import { Injectable } from '@angular/core';
import emailjs from 'emailjs-com';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private serviceId = 'your_service_id';
  private templateId = 'your_template_id';
  private userId = 'your_user_id'; // Use EmailJS user id

  constructor() {}

  sendEmail(name: string, email: string, message: string) {
    const templateParams = {
      name,
      email,
      message,
    };

    return emailjs.send(this.serviceId, this.templateId, templateParams, this.userId);
  }
}
