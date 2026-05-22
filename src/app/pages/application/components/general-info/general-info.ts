import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { OnlineApplication } from '@api/models/los/online';
import {
  GeneralInfoRowAuthority,
  GeneralInfoRowDocuments,
  GeneralInfoRowEmployment,
  GeneralInfoRowName,
} from '@pages/application/components/general-info/components';
import { Card, Steps } from '@shared/components';
import { FlowForm } from '@pages/application/models/form';

@Component({
  selector: 'cf-general-info',
  imports: [
    Card,
    Steps,
    TranslocoDirective,
    GeneralInfoRowName,
    GeneralInfoRowDocuments,
    GeneralInfoRowAuthority,
    GeneralInfoRowEmployment,
  ],
  templateUrl: './general-info.html',
  styleUrl: './general-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralInfo {
  public readonly application = input<OnlineApplication>();
  public readonly form = input.required<FieldTree<FlowForm>>();
}
