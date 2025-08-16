import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderedProjectsComponent } from './ordered-projects.component';

describe('OrderedProjectsComponent', () => {
  let component: OrderedProjectsComponent;
  let fixture: ComponentFixture<OrderedProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderedProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderedProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
