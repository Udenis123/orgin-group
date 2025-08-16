import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchedProjectUpdateComponent } from './launched.component';

describe('LaunchedProjectUpdateComponent', () => {
  let component: LaunchedProjectUpdateComponent;
  let fixture: ComponentFixture<LaunchedProjectUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaunchedProjectUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaunchedProjectUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
