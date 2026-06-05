import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { OnlineBorrower, OnlineCreateApplicationPayload } from '@api/models/los/online';
import { InputDefault, LabelControlSecondary } from '@shared/components';

@Component({
  selector: 'cf-general-info-row-documents',
  imports: [TranslocoDirective, LabelControlSecondary, InputDefault, FormField],
  templateUrl: './general-info-row-documents.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralInfoRowDocuments {
  readonly borrower = input<OnlineBorrower>();
  readonly form = input.required<FieldTree<OnlineCreateApplicationPayload>>();
}
