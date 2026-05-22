import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { TranslocoDirective } from '@jsverse/transloco';
import { LabelControlSecondary, SelectDefault } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { OnlineBorrower } from '@api/models/los/online';
import { FlowForm } from '@pages/application/models/form';

@Component({
  selector: 'cf-general-info-row-authority',
  imports: [TranslocoDirective, LabelControlSecondary, SelectDefault, FormField, HandbookDirective, NzOptionComponent],
  templateUrl: './general-info-row-authority.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralInfoRowAuthority {
  readonly borrower = input<OnlineBorrower>();
  readonly form = input.required<FieldTree<FlowForm>>();
}
