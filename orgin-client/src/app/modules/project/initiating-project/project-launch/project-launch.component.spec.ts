import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectLaunchComponent } from './project-launch.component';

describe('ProjectLaunchComponent', () => {
  let component: ProjectLaunchComponent;
  let fixture: ComponentFixture<ProjectLaunchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectLaunchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectLaunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
