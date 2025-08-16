import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAnalyticsComponent } from './add-analytics.component';

describe('AddAnalyticsComponent', () => {
  let component: AddAnalyticsComponent;
  let fixture: ComponentFixture<AddAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
