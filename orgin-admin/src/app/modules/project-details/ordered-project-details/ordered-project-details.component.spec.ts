import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderedProjectDetailsComponent } from './ordered-project-details.component';

describe('OrderedProjectDetailsComponent', () => {
  let component: OrderedProjectDetailsComponent;
  let fixture: ComponentFixture<OrderedProjectDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderedProjectDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderedProjectDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
