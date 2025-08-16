import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchCommunityProjectComponent } from './launch-community-project.component';

describe('LaunchCommunityProjectComponent', () => {
  let component: LaunchCommunityProjectComponent;
  let fixture: ComponentFixture<LaunchCommunityProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaunchCommunityProjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaunchCommunityProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
