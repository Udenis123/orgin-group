import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAnalyzerComponent } from './update-analyzer.component';

describe('UpdateAnalyzerComponent', () => {
  let component: UpdateAnalyzerComponent;
  let fixture: ComponentFixture<UpdateAnalyzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateAnalyzerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateAnalyzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
