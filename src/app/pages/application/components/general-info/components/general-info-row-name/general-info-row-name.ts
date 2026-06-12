import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { TranslocoDirective } from '@jsverse/transloco';
import { InputDefault, LabelControlSecondary, SelectDate, SelectWrapper } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { OnlineBorrower } from '@api/models/los/application';
import { OnlineCreateApplicationPayload } from '@api/models/los/start-processing';

@Component({
  selector: 'cf-general-info-row-name',
  imports: [
    TranslocoDirective,
    LabelControlSecondary,
    InputDefault,
    SelectWrapper,
    SelectDate,
    FormField,
    HandbookDirective,
    NzOptionComponent,
    DatePipe,
  ],
  templateUrl: './general-info-row-name.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralInfoRowName {
  readonly borrower = input<OnlineBorrower>();
  readonly form = input.required<FieldTree<OnlineCreateApplicationPayload>>();
}
