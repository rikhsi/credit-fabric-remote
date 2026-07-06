import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { DatePipe } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { OnlineCreateApplicationPayload } from '@api/models/los/start-processing';
import { FinanceMonthPipe } from '@pages/application/pipes/finance-month.pipe';
import { isFinanceRevenueIncomeValid } from '@pages/application/utils/flow-step.validation';
import { InputDefault, LabelControlSecondary, SelectDefault, SelectDefaultMobile } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { PluralizePipe } from '@shared/pipes';

@Component({
  selector: 'cf-finance-form',
  imports: [
    FinanceMonthPipe,
    InputDefault,
    LabelControlSecondary,
    SelectDefault,
    SelectDefaultMobile,
    NzOptionComponent,
    NzIconDirective,
    NzTagComponent,
    TranslocoDirective,
    HandbookDirective,
    FormField,
    PluralizePipe,
    DatePipe,
  ],
  templateUrl: './finance-form.html',
  styleUrl: './finance-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceForm {
  readonly form = input.required<FieldTree<OnlineCreateApplicationPayload>>();

  readonly showRevenueIncomeAlert = computed(() => !isFinanceRevenueIncomeValid(this.form()().value().finData));
}
