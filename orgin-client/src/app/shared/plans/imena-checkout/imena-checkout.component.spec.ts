import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImenaCheckoutComponent } from './imena-checkout.component';

describe('ImenaCheckoutComponent', () => {
  let component: ImenaCheckoutComponent;
  let fixture: ComponentFixture<ImenaCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImenaCheckoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImenaCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
