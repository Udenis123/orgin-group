import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientFeedbackApprovalComponent } from './client-feedback-approval.component';

describe('ClientFeedbackApprovalComponent', () => {
  let component: ClientFeedbackApprovalComponent;
  let fixture: ComponentFixture<ClientFeedbackApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientFeedbackApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientFeedbackApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
