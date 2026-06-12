import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { TranslocoDirective } from '@jsverse/transloco';
import { InputDefault, LabelControlSecondary, SelectDefault, SelectDefaultMobile } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { HandbookSelectOptionsPipe } from '@shared/pipes';
import { OnlineBorrower } from '@api/models/los/application';
import { OnlineCreateApplicationPayload } from '@api/models/los/start-processing';

@Component({
  selector: 'cf-general-info-row-employment',
  host: { class: 'bottom-gap' },
  imports: [
    TranslocoDirective,
    LabelControlSecondary,
    SelectDefault,
    SelectDefaultMobile,
    HandbookSelectOptionsPipe,
    InputDefault,
    FormField,
    HandbookDirective,
    NzOptionComponent,
  ],
  templateUrl: './general-info-row-employment.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralInfoRowEmployment {
  readonly borrower = input<OnlineBorrower>();
  readonly form = input.required<FieldTree<OnlineCreateApplicationPayload>>();
}
