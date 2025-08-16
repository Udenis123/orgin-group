import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyzerDetailsComponent } from './analyzer-details.component';

describe('AnalyzerDetailsComponent', () => {
  let component: AnalyzerDetailsComponent;
  let fixture: ComponentFixture<AnalyzerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyzerDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyzerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
