import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailOtpValidationComponent } from './email-otp-validation.component';

describe('EmailOtpValidationComponent', () => {
  let component: EmailOtpValidationComponent;
  let fixture: ComponentFixture<EmailOtpValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailOtpValidationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailOtpValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
