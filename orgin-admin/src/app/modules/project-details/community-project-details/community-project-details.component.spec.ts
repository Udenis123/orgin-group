import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityProjectDetailsComponent } from './community-project-details.component';

describe('CommunityProjectDetailsComponent', () => {
  let component: CommunityProjectDetailsComponent;
  let fixture: ComponentFixture<CommunityProjectDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityProjectDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityProjectDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
