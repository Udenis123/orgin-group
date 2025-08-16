import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityProjectUpdateComponent } from './community.component';

describe('CommunityProjectUpdateComponent', () => {
  let component: CommunityProjectUpdateComponent;
  let fixture: ComponentFixture<CommunityProjectUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityProjectUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityProjectUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
