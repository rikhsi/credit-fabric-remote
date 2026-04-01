import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Card, LabelControl } from '@shared/components';

@Component({
  selector: 'cf-general-info',
  imports: [Card, LabelControl],
  templateUrl: './general-info.html',
  styleUrl: './general-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralInfo {}
