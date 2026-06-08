import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskDirective } from 'ngx-mask';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';

@Component({
    selector: 'app-payment-topup-business-cards',
    imports: [CommonModule, ReactiveFormsModule, UiSvgIconComponent, MatFormFieldModule, MatSelectModule, FormsModule,
        NgxMaskDirective,
    ],
    templateUrl: './payment-topup-business-cards.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentTopupBusinessCardsComponent {
  constructor(private fb: FormBuilder) {}
  form = this.fb.nonNullable.group({
    isCreateTemplate: false,
    selectedCurrencyVal: 'uzb',
  });
}
