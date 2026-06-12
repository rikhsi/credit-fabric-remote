import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { DatePipe } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { OnlineCreateApplicationPayload } from '@api/models/los/start-processing';
import { FinanceMonthPipe } from '@pages/application/pipes/finance-month.pipe';
import { InputDefault, LabelControlSecondary, SelectWrapper } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { PluralizePipe } from '@shared/pipes';

@Component({
  selector: 'cf-finance-form',
  imports: [
    FinanceMonthPipe,
    InputDefault,
    LabelControlSecondary,
    SelectWrapper,
    NzOptionComponent,
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
}
