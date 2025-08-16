import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAnalyzerComponent } from './new-analyzer.component';

describe('NewAnalyzerComponent', () => {
  let component: NewAnalyzerComponent;
  let fixture: ComponentFixture<NewAnalyzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewAnalyzerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAnalyzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
