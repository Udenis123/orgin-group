import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderedProjectUpdateComponent } from './ordered.component';

describe('OrderedProjectUpdateComponent', () => {
  let component: OrderedProjectUpdateComponent;
  let fixture: ComponentFixture<OrderedProjectUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderedProjectUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderedProjectUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
