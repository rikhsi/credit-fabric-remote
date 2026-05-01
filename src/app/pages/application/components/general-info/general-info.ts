import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { Card, InputNumber, LabelControlSecondary, SelectDefault, Steps } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { FlowForm } from '@pages/application/models';

@Component({
  selector: 'cf-general-info',
  imports: [
    Card,
    LabelControlSecondary,
    Steps,
    InputNumber,
    SelectDefault,
    NzOptionComponent,
    TranslocoDirective,
    HandbookDirective,
    FormField,
  ],
  templateUrl: './general-info.html',
  styleUrl: './general-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralInfo {
  public readonly form = input<FieldTree<FlowForm>>();
}
