import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { NzRadioComponent, NzRadioGroupComponent } from 'ng-zorro-antd/radio';
import { InputSlider, LabelControlSecondary, SelectDefault, SelectDefaultMobile } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { CalculatorFormModel } from '@pages/loan/models';

@Component({
  selector: 'cf-calculator-form',
  imports: [
    InputSlider,
    LabelControlSecondary,
    SelectDefault,
    SelectDefaultMobile,
    NzOptionComponent,
    NzRadioComponent,
    NzRadioGroupComponent,
    FormField,
    TranslocoDirective,
    HandbookDirective,
  ],
  templateUrl: './calculator-form.html',
  styleUrl: './calculator-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorForm {
  public readonly form = input<FieldTree<CalculatorFormModel>>();
}
