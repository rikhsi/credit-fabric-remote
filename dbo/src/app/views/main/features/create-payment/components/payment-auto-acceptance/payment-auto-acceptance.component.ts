import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';

@Component({
    selector: 'app-payment-auto-acceptance',
    imports: [CommonModule, ReactiveFormsModule, UiSvgIconComponent, MatFormFieldModule, MatSelectModule, FormsModule,
        MatDatepickerModule, MatInputModule],
    templateUrl: './payment-auto-acceptance.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentAutoAcceptanceComponent {
  constructor(private fb: FormBuilder) {}
  form = this.fb.nonNullable.group({
    isCreateTemplate: false,
  });
}
