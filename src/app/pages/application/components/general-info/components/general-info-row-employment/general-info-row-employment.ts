import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { TranslocoDirective } from '@jsverse/transloco';
import { OnlineBorrower } from '@api/models/los';
import { FlowForm } from '@pages/application/models';
import { InputNumber, SelectDefault } from '@shared/components';
import { HandbookDirective } from '@shared/directives';

@Component({
  selector: 'cf-general-info-row-employment',
  host: { class: 'bottom-gap' },
  imports: [TranslocoDirective, SelectDefault, InputNumber, FormField, HandbookDirective, NzOptionComponent],
  templateUrl: './general-info-row-employment.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralInfoRowEmployment {
  readonly borrower = input<OnlineBorrower>();
  readonly form = input.required<FieldTree<FlowForm>>();
}
