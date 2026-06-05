import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { Card } from '@shared/components';
import { ExtraInfoItem } from '@pages/application/components/extra-info/components';
import { OnlineStartProcessingExtraInformation } from '@api/models/los/online';

@Component({
  selector: 'cf-extra-info',
  imports: [Card, NzButtonComponent, NzIconDirective, TranslocoDirective, ExtraInfoItem, NzTagComponent],
  templateUrl: './extra-info.html',
  styleUrl: './extra-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtraInfo {
  readonly items = input<OnlineStartProcessingExtraInformation[]>([]);

  readonly add = output<void>();
  readonly edit = output<number>();
}
