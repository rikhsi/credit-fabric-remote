import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskDirective } from 'ngx-mask';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';

@Component({
    selector: 'app-payment-currency-operations',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiSvgIconComponent,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        NgxMaskDirective,
    ],
    templateUrl: './payment-currency-operations.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class PaymentCurrencyOperationsComponent {
  constructor(private fb: FormBuilder) {}
  form = this.fb.nonNullable.group({
    isCreateTemplate: false,
    selectedBuyCurrencyVal: 'uzb',
    selectedSellCurrencyVal: 'rub',
  });
}
