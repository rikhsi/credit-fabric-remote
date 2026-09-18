import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzRadioComponent, NzRadioGroupComponent } from 'ng-zorro-antd/radio';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { InputSlider, LabelControlSecondary } from '@shared/components';
import { LoanDetailFormModel } from '@pages/loan/models';
import { CalculationTypeModal } from '../calculation-type-modal/calculation-type-modal';

@Component({
  selector: 'cf-calculator-form',
  imports: [
    InputSlider,
    LabelControlSecondary,
    NzRadioComponent,
    NzRadioGroupComponent,
    NzIconDirective,
    FormField,
    TranslocoDirective,
  ],
  templateUrl: './calculator-form.html',
  styleUrl: './calculator-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorForm {
  private readonly nmService = inject(NzModalService);

  public readonly form = input<FieldTree<LoanDetailFormModel>>();

  openCalculationTypeInfo(): void {
    this.nmService.create({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: CalculationTypeModal,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
    });
  }
}
