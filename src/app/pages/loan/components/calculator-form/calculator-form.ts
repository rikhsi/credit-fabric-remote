import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzRadioComponent, NzRadioGroupComponent } from 'ng-zorro-antd/radio';
import { InputSlider, LabelControl } from '@shared/components';

@Component({
  selector: 'cf-calculator-form',
  imports: [InputSlider, LabelControl, NzRadioComponent, NzRadioGroupComponent, FormsModule],
  templateUrl: './calculator-form.html',
  styleUrl: './calculator-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorForm {
  creditType = signal<string>('annuity');
}
