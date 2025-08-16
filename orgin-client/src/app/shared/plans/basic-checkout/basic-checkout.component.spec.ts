import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicCheckoutComponent } from './basic-checkout.component';

describe('BasicCheckoutComponent', () => {
  let component: BasicCheckoutComponent;
  let fixture: ComponentFixture<BasicCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicCheckoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
