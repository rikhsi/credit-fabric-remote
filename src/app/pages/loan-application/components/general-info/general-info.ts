import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { Card, InputNumber, LabelControlSecondary, SelectDefault, Steps } from '@shared/components';

@Component({
  selector: 'cf-general-info',
  imports: [Card, LabelControlSecondary, Steps, InputNumber, SelectDefault, NzOptionComponent],
  templateUrl: './general-info.html',
  styleUrl: './general-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralInfo {}
