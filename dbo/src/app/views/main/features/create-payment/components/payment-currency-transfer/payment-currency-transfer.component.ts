import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskDirective } from 'ngx-mask';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';

@Component({
    selector: 'app-payment-currency-transfer',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiSvgIconComponent,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        NgxMaskDirective,
        MatDatepickerModule,
        MatInputModule
    ],
    templateUrl: './payment-currency-transfer.component.html',
    styles: `
     .form-control:checked ~ label {
      color: #007AFF;
      input[type="radio"] {
        background: #E5E7EA
      }
    }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentCurrencyTransferComponent {
  constructor(private fb: FormBuilder) {}
  form = this.fb.nonNullable.group({
    isCreateTemplate: false,
    selectedCurrencyVal: 'uzb',
    bankBeneficiary: 'swift',
    bankRequisites: 'show',
  });
}
