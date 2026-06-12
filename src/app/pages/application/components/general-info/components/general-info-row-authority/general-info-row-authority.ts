import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { TranslocoDirective } from '@jsverse/transloco';
import { LabelControlSecondary, SelectDefault, SelectDefaultMobile } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { OnlineBorrower } from '@api/models/los/application';
import { OnlineCreateApplicationPayload } from '@api/models/los/start-processing';

@Component({
  selector: 'cf-general-info-row-authority',
  imports: [TranslocoDirective, LabelControlSecondary, SelectDefault, SelectDefaultMobile, FormField, HandbookDirective, NzOptionComponent],
  templateUrl: './general-info-row-authority.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralInfoRowAuthority {
  readonly borrower = input<OnlineBorrower>();
  readonly form = input.required<FieldTree<OnlineCreateApplicationPayload>>();
}
