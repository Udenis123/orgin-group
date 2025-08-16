import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchedProjectsComponent } from './launched-projects.component';

describe('LaunchedProjectsComponent', () => {
  let component: LaunchedProjectsComponent;
  let fixture: ComponentFixture<LaunchedProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaunchedProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaunchedProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
