import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailService } from '../../core/email.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  name: string = '';
  email: string = '';
  message: string = '';

  constructor(private emailService: EmailService) {}

  ngOnInit(): void {
    // Add an animation class when the component is initialized
    document.querySelector('.contact')?.classList.add('fadeIn');
  }

  onSubmit() {
    if (this.name && this.email && this.message) {
      this.emailService.sendEmail(this.name, this.email, this.message).then(
        (response) => {
          console.log('Email sent successfully', response);
          alert('Your message has been sent!');
          this.resetForm();
        },
        (error) => {
          console.log('Error sending email', error);
          alert('Oops! Something went wrong, please try again later.');
        }
      );
    } else {
      alert('Please fill in all fields before submitting.');
    }
  }

  resetForm() {
    this.name = '';
    this.email = '';
    this.message = '';
  }
}
