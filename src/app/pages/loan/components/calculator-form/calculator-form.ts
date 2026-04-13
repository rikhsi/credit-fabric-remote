import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzRadioComponent, NzRadioGroupComponent } from 'ng-zorro-antd/radio';
import { InputSlider, LabelControlSecondary } from '@shared/components';

@Component({
  selector: 'cf-calculator-form',
  imports: [InputSlider, LabelControlSecondary, NzRadioComponent, NzRadioGroupComponent, FormsModule, TranslocoDirective],
  templateUrl: './calculator-form.html',
  styleUrl: './calculator-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorForm {
  creditType = signal<string>('annuity');
}
