import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchedProjectDetailsComponent } from './launched-project-details.component';

describe('LaunchedProjectDetailsComponent', () => {
  let component: LaunchedProjectDetailsComponent;
  let fixture: ComponentFixture<LaunchedProjectDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaunchedProjectDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaunchedProjectDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
