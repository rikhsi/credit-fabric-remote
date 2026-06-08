import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';

@Component({
    selector: 'app-payment-requirement',
    imports: [CommonModule, ReactiveFormsModule, UiSvgIconComponent, MatFormFieldModule, MatSelectModule, FormsModule],
    templateUrl: './payment-requirement.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentRequirementComponent {
  constructor(private fb: FormBuilder) {}
  form = this.fb.nonNullable.group({
    isCreateTemplate: false,
  });
}
