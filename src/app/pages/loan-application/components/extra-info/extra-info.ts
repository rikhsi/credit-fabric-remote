import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { Card } from '@shared/components';

@Component({
  selector: 'cf-extra-info',
  imports: [Card],
  templateUrl: './extra-info.html',
  styleUrl: './extra-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtraInfo {
  readonly add = output<void>();
  readonly edit = output<void>();
}
