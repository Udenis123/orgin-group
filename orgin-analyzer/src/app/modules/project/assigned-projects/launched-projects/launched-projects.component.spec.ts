import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedLaunchedProjectsComponent } from './launched-projects.component';

describe('LaunchedProjectsComponent', () => {
  let component: AssignedLaunchedProjectsComponent;
  let fixture: ComponentFixture<AssignedLaunchedProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignedLaunchedProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignedLaunchedProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
