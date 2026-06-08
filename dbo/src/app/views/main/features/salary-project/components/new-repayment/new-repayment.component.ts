import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';

@Component({
  selector: 'app-new-repayment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UiSvgIconComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
  ],
  templateUrl: './new-repayment.component.html',
  styles: `
   .payment-mat-date,
      .payment-select {
        .mdc-notched-outline__leading,
        .mdc-notched-outline__notch,
        .mdc-notched-outline__trailing {
          border-color: #dbdbdb !important;
        }
        .mdc-text-field--outlined {
          --mdc-outlined-text-field-container-shape: 10px !important;
        }
        .mat-mdc-select-arrow {
          display: none;
        }
        .mat-mdc-form-field-flex {
          height: 44px;
          padding: 8px;
        }
        .mat-mdc-form-field-infix {
          padding-top: 16px;
          top: -15px;
        }
        .mat-mdc-select-placeholder,
        .mat-mdc-form-field-input-control,
        .mat-mdc-select-value-text {
          color: #000;
        }
        .mat-mdc-form-field-icon-suffix {
          width: 40px;
        }
        .mat-mdc-text-field-wrapper {
          padding: 0;
        }
      }
      .payment-currency-select {
        .mat-mdc-select-arrow-wrapper {
          display: none;
        }
        padding-left: 25px;
        font-size: 14px;
      }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class NewRepaymentComponent {
  constructor(private fb: FormBuilder) {}
  form = this.fb.nonNullable.group({
    isCreateTemplate: false,
  });
}
