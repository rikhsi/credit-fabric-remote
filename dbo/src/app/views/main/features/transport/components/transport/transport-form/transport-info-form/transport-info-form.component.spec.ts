import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportInfoFormComponent } from './transport-info-form.component';

describe('TransportInfoFormComponent', () => {
  let component: TransportInfoFormComponent;
  let fixture: ComponentFixture<TransportInfoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransportInfoFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TransportInfoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
