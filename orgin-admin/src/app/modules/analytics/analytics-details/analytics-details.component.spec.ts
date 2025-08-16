import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsDetailsComponent } from './analytics-details.component';

describe('AnalyticsDetailsComponent', () => {
  let component: AnalyticsDetailsComponent;
  let fixture: ComponentFixture<AnalyticsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyticsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
