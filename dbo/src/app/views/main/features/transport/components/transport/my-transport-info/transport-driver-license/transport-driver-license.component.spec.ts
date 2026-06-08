import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportDriverLicenseComponent } from './transport-driver-license.component';

describe('TransportDriverLicenseComponent', () => {
  let component: TransportDriverLicenseComponent;
  let fixture: ComponentFixture<TransportDriverLicenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransportDriverLicenseComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TransportDriverLicenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
