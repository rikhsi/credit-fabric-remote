import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { Card } from '@shared/components';
import { FlowExtraInformationForm } from '@pages/application/models/form';
import { ExtraInfoItem } from '@pages/application/components/extra-info/components';

@Component({
  selector: 'cf-extra-info',
  imports: [Card, NzButtonComponent, NzIconDirective, NzTypographyComponent, TranslocoDirective, ExtraInfoItem],
  templateUrl: './extra-info.html',
  styleUrl: './extra-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtraInfo {
  readonly items = input<FlowExtraInformationForm[]>([]);

  readonly add = output<void>();
  readonly edit = output<number>();
}
