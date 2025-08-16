import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedProjectDetailsComponent } from './assigned-project-details.component';

describe('AssignedProjectDetailsComponent', () => {
  let component: AssignedProjectDetailsComponent;
  let fixture: ComponentFixture<AssignedProjectDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignedProjectDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignedProjectDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
